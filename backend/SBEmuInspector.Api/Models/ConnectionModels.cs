using Microsoft.Extensions.Configuration;

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

/// <summary>Configuration scenario for different deployment environments</summary>
public record EmulatorConfigurationScenario(
    string Name,
    string Description,
    string ConnectionString,
    string Host,
    string[] CommonQueues,
    string[] CommonTopics);

/// <summary>Default configuration for Azure Service Bus Emulator</summary>
public static class EmulatorDefaults
{
    public const string DefaultConnectionString = "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;";
    public const string EmulatorHost = "localhost:5672";
    public static readonly string[] CommonTestQueues = { "sample-queue", "dev-queue", "test-queue", "integration-queue" };
    public static readonly string[] CommonTestTopics = { "domain-events", "dev-topic", "test-topic", "integration-events" };
    
    /// <summary>Get configuration scenarios, with support for environment variable overrides</summary>
    public static EmulatorConfigurationScenario[] GetConfigurationScenarios(IConfiguration? configuration = null)
    {
        var baseScenarios = ConfigurationScenarios;
        
        // Allow override from environment variables
        var customConnectionString = configuration?.GetValue<string>("SBEmuInspector:CustomConnectionString");
        var customEntityList = configuration?.GetValue<string>("SBEmuInspector:CustomEntities");
        
        if (!string.IsNullOrEmpty(customConnectionString))
        {
            var customQueues = CommonTestQueues;
            var customTopics = CommonTestTopics;
            
            if (!string.IsNullOrEmpty(customEntityList))
            {
                var entities = customEntityList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(e => e.Trim())
                    .ToArray();
                
                customQueues = entities.Where(e => !e.Contains("topic", StringComparison.OrdinalIgnoreCase)).ToArray();
                customTopics = entities.Where(e => e.Contains("topic", StringComparison.OrdinalIgnoreCase)).ToArray();
            }
            
            return baseScenarios.Concat(new[] {
                new EmulatorConfigurationScenario(
                    "Custom Configuration",
                    "Configuration loaded from environment variables",
                    customConnectionString,
                    GetHostFromConnectionString(customConnectionString),
                    customQueues,
                    customTopics
                )
            }).ToArray();
        }
        
        return baseScenarios;
    }
    
    private static string GetHostFromConnectionString(string connectionString)
    {
        try
        {
            const string connectionStringPrefix = "Endpoint=sb://";
            if (!connectionString.StartsWith(connectionStringPrefix, StringComparison.OrdinalIgnoreCase))
                return "unknown";
                
            var endIndex = connectionString.IndexOf(';', connectionStringPrefix.Length);
            if (endIndex == -1) return "unknown";
            
            var host = connectionString.Substring(connectionStringPrefix.Length, endIndex - connectionStringPrefix.Length);
            return host.TrimEnd('/');
        }
        catch
        {
            return "unknown";
        }
    }
    
    public static readonly EmulatorConfigurationScenario[] ConfigurationScenarios = {
        new(
            "Local Development",
            "Emulator running on your local machine",
            "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
            "localhost:5672",
            CommonTestQueues,
            CommonTestTopics
        ),
        new(
            "Docker to Host",
            "Inspector in Docker, Emulator on host machine",
            "Endpoint=sb://host.docker.internal;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
            "host.docker.internal:5672",
            CommonTestQueues,
            CommonTestTopics
        ),
        new(
            "Both in Docker",
            "Both Inspector and Emulator running in Docker containers",
            "Endpoint=sb://servicebus-emulator;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
            "servicebus-emulator:5672",
            CommonTestQueues,
            CommonTestTopics
        )
    };
}