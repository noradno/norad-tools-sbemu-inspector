namespace SBEmuInspector.Api.Models;

/// <summary>Request model for creating a new connection</summary>
public record ConnectionRequest(
    string ConnectionString,
    string? EntityName,
    string? SubscriptionName);

/// <summary>Information about the current connection</summary>
public record ConnectionInfo(
    string Host,
    string EntityType,
    string EntityName,
    string? SubscriptionName,
    bool IsConnected,
    bool IsEmulator);

/// <summary>Default configuration for Azure Service Bus Emulator</summary>
public static class EmulatorDefaults
{
    public const string DefaultConnectionString = "Endpoint=sb://localhost:5672;SharedAccessKeyName=all;SharedAccessKey=CLwo3FQ3S39Z4pFOQDefaiUd1dSsli4XOAj3Y9Uh1E=;UseDevelopmentEmulator=true";
    public const string EmulatorHost = "localhost:5672";
    public static readonly string[] CommonTestQueues = { "test-queue", "dev-queue", "debug-queue" };
    public static readonly string[] CommonTestTopics = { "test-topic", "dev-topic" };
}