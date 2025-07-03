using SBEmuInspector.Api.Models;
using ConnectionInfo = SBEmuInspector.Api.Models.ConnectionInfo;

namespace SBEmuInspector.Api.Services;

/// <summary>Service interface for Azure Service Bus operations</summary>
public interface IServiceBusService
{
    /// <summary>Gets a value indicating whether the service is connected to a Service Bus instance</summary>
    bool IsConnected { get; }

    /// <summary>Gets the current connection information</summary>
    ConnectionInfo? CurrentConnection { get; }

    /// <summary>Connects to the specified Service Bus entity</summary>
    Task<OperationResult<ConnectionInfo>> ConnectAsync(ConnectionRequest request);

    /// <summary>Disconnects from the current Service Bus instance</summary>
    Task<OperationResult<bool>> DisconnectAsync();

    /// <summary>Peeks messages from the connected Service Bus entity</summary>
    Task<OperationResult<PagedResult<PeekedMessageInfo>>> PeekMessagesAsync(int maxMessages = 100);

    /// <summary>Peeks a specific message by ID</summary>
    Task<OperationResult<MessageDto?>> PeekMessageAsync(string messageId);

    /// <summary>Receives and completes a message from the connected Service Bus entity</summary>
    Task<OperationResult<MessageDto?>> ReceiveMessageAsync();

    /// <summary>Sends a message to the connected Service Bus entity</summary>
    Task<OperationResult<bool>> SendMessageAsync(SendMessageRequest request);

    /// <summary>Gets a list of available entities (queues and topics)</summary>
    Task<OperationResult<string[]>> GetEntitiesAsync();
}