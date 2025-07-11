using Azure.Messaging.ServiceBus;
using SBEmuInspector.Api.Models;
using System.Text.Json;
using ConnectionInfo = SBEmuInspector.Api.Models.ConnectionInfo;

namespace SBEmuInspector.Api.Services;

/// <summary>Service for Azure Service Bus operations</summary>
public class ServiceBusService : IServiceBusService, IAsyncDisposable
{
    private const int MaxMessagesToPeek = 100;
    private ServiceBusClient? _client;
    private readonly ILogger<ServiceBusService> _logger;

    public ServiceBusService(ILogger<ServiceBusService> logger)
    {
        _logger = logger;
    }

    public bool IsConnected => _client != null && CurrentConnection != null;

    public ConnectionInfo? CurrentConnection { get; private set; }

    public async Task<OperationResult<ConnectionInfo>> ConnectAsync(ConnectionRequest request)
    {
        try
        {
            if (IsConnected)
            {
                await DisconnectAsync();
            }

            if (string.IsNullOrWhiteSpace(request.ConnectionString) || string.IsNullOrWhiteSpace(request.EntityName))
            {
                return new OperationResult<ConnectionInfo>(false, null, "Connection string and entity name are required");
            }

            _client = new ServiceBusClient(request.ConnectionString);
            var host = GetServiceBusHost(request.ConnectionString);
            var isEmulator = IsEmulatorConnection(host);

            // Validate connection by attempting to create a receiver
            try
            {
                _logger.LogInformation("Validating connection to Service Bus at {Host}", host);
                
                ServiceBusReceiver testReceiver;
                if (string.IsNullOrWhiteSpace(request.SubscriptionName))
                {
                    testReceiver = _client.CreateReceiver(request.EntityName);
                }
                else
                {
                    testReceiver = _client.CreateReceiver(request.EntityName, request.SubscriptionName);
                }

                // Attempt to peek a message with a very short timeout
                using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)))
                {
                    await testReceiver.PeekMessageAsync(cancellationToken: cts.Token);
                }

                await testReceiver.DisposeAsync();
                _logger.LogInformation("Connection validation successful");
            }
            catch (ServiceBusException sbEx) when (sbEx.Reason == ServiceBusFailureReason.MessagingEntityNotFound)
            {
                _logger.LogWarning("Entity '{Entity}' not found, but connection is valid", request.EntityName);
            }
            catch (Exception validationEx)
            {
                if (_client != null)
                {
                    await _client.DisposeAsync();
                    _client = null;
                }
                
                var errorMessage = isEmulator 
                    ? $"Cannot connect to Service Bus Emulator at {host}. Ensure the emulator is running and accessible."
                    : $"Cannot connect to Service Bus at {host}. Please check your connection string and network connectivity.";
                    
                _logger.LogError(validationEx, "Connection validation failed: {Error}", errorMessage);
                return new OperationResult<ConnectionInfo>(false, null, errorMessage);
            }

            CurrentConnection = new ConnectionInfo(
                host,
                string.IsNullOrWhiteSpace(request.SubscriptionName) ? "Queue" : "Topic",
                request.EntityName,
                request.SubscriptionName,
                true,
                isEmulator);

            _logger.LogInformation("Connected to Service Bus: {Host}, Entity: {Entity}, Subscription: {Subscription}",
                host, request.EntityName, request.SubscriptionName);

            return new OperationResult<ConnectionInfo>(true, CurrentConnection, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Service Bus");
            return new OperationResult<ConnectionInfo>(false, null, ex.Message);
        }
    }

    public async Task<OperationResult<bool>> DisconnectAsync()
    {
        try
        {
            if (_client != null)
            {
                await _client.DisposeAsync();
                _client = null;
            }

            CurrentConnection = null;
            _logger.LogInformation("Disconnected from Service Bus");

            return new OperationResult<bool>(true, true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to disconnect from Service Bus");
            return new OperationResult<bool>(false, false, ex.Message);
        }
    }

    public async Task<OperationResult<PagedResult<PeekedMessageInfo>>> PeekMessagesAsync(int maxMessages = MaxMessagesToPeek)
    {
        try
        {
            if (!IsConnected)
            {
                return new OperationResult<PagedResult<PeekedMessageInfo>>(false, null, "Not connected to Service Bus");
            }

            await using var receiver = GetReceiver();
            var messages = await receiver.PeekMessagesAsync(Math.Min(maxMessages, MaxMessagesToPeek));

            var messageInfos = messages.Select(m => new PeekedMessageInfo(
                m.MessageId,
                m.EnqueuedTime,
                m.SequenceNumber,
                m.SessionId)).ToArray();

            var result = new PagedResult<PeekedMessageInfo>(messageInfos, messageInfos.Length, false);
            return new OperationResult<PagedResult<PeekedMessageInfo>>(true, result, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to peek messages");
            return new OperationResult<PagedResult<PeekedMessageInfo>>(false, null, ex.Message);
        }
    }

    public async Task<OperationResult<MessageDto?>> PeekMessageAsync(string messageId)
    {
        try
        {
            if (!IsConnected)
            {
                return new OperationResult<MessageDto?>(false, null, "Not connected to Service Bus");
            }

            await using var receiver = GetReceiver();
            var messages = await receiver.PeekMessagesAsync(MaxMessagesToPeek);

            var targetMessage = messages.FirstOrDefault(m => m.MessageId == messageId);
            if (targetMessage == null)
            {
                return new OperationResult<MessageDto?>(true, null, null);
            }

            var messageDto = new MessageDto(
                targetMessage.MessageId,
                targetMessage.Body.ToString(),
                targetMessage.ContentType ?? "text/plain",
                targetMessage.EnqueuedTime,
                targetMessage.ApplicationProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                targetMessage.SequenceNumber,
                targetMessage.SessionId,
                targetMessage.TimeToLive);

            return new OperationResult<MessageDto?>(true, messageDto, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to peek message {MessageId}", messageId);
            return new OperationResult<MessageDto?>(false, null, ex.Message);
        }
    }

    public async Task<OperationResult<MessageDto?>> ReceiveMessageAsync()
    {
        try
        {
            if (!IsConnected)
            {
                return new OperationResult<MessageDto?>(false, null, "Not connected to Service Bus");
            }

            await using var receiver = GetReceiver();
            var message = await receiver.ReceiveMessageAsync(TimeSpan.FromMilliseconds(100));

            if (message == null)
            {
                return new OperationResult<MessageDto?>(true, null, null);
            }

            await receiver.CompleteMessageAsync(message);

            var messageDto = new MessageDto(
                message.MessageId,
                message.Body.ToString(),
                message.ContentType ?? "text/plain",
                message.EnqueuedTime,
                message.ApplicationProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                message.SequenceNumber,
                message.SessionId,
                message.TimeToLive);

            return new OperationResult<MessageDto?>(true, messageDto, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to receive message");
            return new OperationResult<MessageDto?>(false, null, ex.Message);
        }
    }

    public async Task<OperationResult<bool>> SendMessageAsync(SendMessageRequest request)
    {
        try
        {
            if (!IsConnected)
            {
                return new OperationResult<bool>(false, false, "Not connected to Service Bus");
            }

            await using var sender = GetSender();

            var message = new ServiceBusMessage(request.Body)
            {
                ContentType = request.ContentType ?? "application/json",
                MessageId = Guid.NewGuid().ToString()
            };

            if (request.TimeToLive.HasValue)
            {
                message.TimeToLive = request.TimeToLive.Value;
            }

            if (request.ScheduledEnqueueTime.HasValue)
            {
                message.ScheduledEnqueueTime = request.ScheduledEnqueueTime.Value;
            }

            if (request.ApplicationProperties != null)
            {
                foreach (var property in request.ApplicationProperties)
                {
                    if (!string.IsNullOrEmpty(property.Key))
                    {
                        message.ApplicationProperties[property.Key] = ConvertJsonElementToValue(property.Value);
                    }
                }
            }

            await sender.SendMessageAsync(message);
            return new OperationResult<bool>(true, true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send message");
            return new OperationResult<bool>(false, false, ex.Message);
        }
    }

    public Task<OperationResult<string[]>> GetEntitiesAsync()
    {
        // This is a simplified implementation - in a real scenario, you'd use ServiceBusAdministrationClient
        // For the emulator, we'll return common test entities
        try
        {
            if (!IsConnected)
            {
                return Task.FromResult(new OperationResult<string[]>(false, null, "Not connected to Service Bus"));
            }

            var entities = new List<string>();
            entities.AddRange(EmulatorDefaults.CommonTestQueues);
            entities.AddRange(EmulatorDefaults.CommonTestTopics);

            return Task.FromResult(new OperationResult<string[]>(true, entities.ToArray(), null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get entities");
            return Task.FromResult(new OperationResult<string[]>(false, null, ex.Message));
        }
    }

    private ServiceBusReceiver GetReceiver()
    {
        if (!IsConnected || _client == null || CurrentConnection == null)
        {
            throw new InvalidOperationException("Service Bus is not connected");
        }

        var options = new ServiceBusReceiverOptions
        {
            ReceiveMode = ServiceBusReceiveMode.PeekLock
        };

        return string.IsNullOrWhiteSpace(CurrentConnection.SubscriptionName)
            ? _client.CreateReceiver(CurrentConnection.EntityName, options)
            : _client.CreateReceiver(CurrentConnection.EntityName, CurrentConnection.SubscriptionName, options);
    }

    private ServiceBusSender GetSender()
    {
        if (!IsConnected || _client == null || CurrentConnection == null)
        {
            throw new InvalidOperationException("Service Bus is not connected");
        }

        return _client.CreateSender(CurrentConnection.EntityName);
    }

    private static string GetServiceBusHost(string connectionString)
    {
        const string connectionStringPrefix = "Endpoint=sb://";

        if (!connectionString.StartsWith(connectionStringPrefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Invalid Service Bus connection string", nameof(connectionString));
        }

        var endIndex = connectionString.IndexOf(';', connectionStringPrefix.Length);
        if (endIndex == -1)
        {
            throw new ArgumentException("Invalid Service Bus connection string", nameof(connectionString));
        }

        var span = connectionString.AsSpan();
        var host = span.Slice(connectionStringPrefix.Length, endIndex - connectionStringPrefix.Length);
        host = host.TrimEnd('/');

        return host.ToString();
    }

    private static bool IsEmulatorConnection(string host)
    {
        return host.Contains("localhost") || host.Contains("127.0.0.1") || host.Contains("::1");
    }

    private static object ConvertJsonElementToValue(object value)
    {
        if (value is JsonElement jsonElement)
        {
            return jsonElement.ValueKind switch
            {
                JsonValueKind.String => jsonElement.GetString()!,
                JsonValueKind.Number when jsonElement.TryGetInt32(out var intValue) => intValue,
                JsonValueKind.Number when jsonElement.TryGetInt64(out var longValue) => longValue,
                JsonValueKind.Number => jsonElement.GetDouble(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null!,
                _ => jsonElement.ToString()
            };
        }
        
        return value;
    }

    public async ValueTask DisposeAsync()
    {
        if (_client != null)
        {
            await _client.DisposeAsync();
        }
    }
}