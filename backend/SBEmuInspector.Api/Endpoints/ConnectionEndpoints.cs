using SBEmuInspector.Api.Models;
using SBEmuInspector.Api.Services;
using ConnectionInfo = SBEmuInspector.Api.Models.ConnectionInfo;

namespace SBEmuInspector.Api.Endpoints;

/// <summary>Extension methods for connection-related endpoints</summary>
public static class ConnectionEndpoints
{
    /// <summary>Maps connection-related endpoints</summary>
    public static void MapConnectionEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/connections")
            .WithTags("Connections")
            .WithOpenApi();

        // POST /api/connections - Create new connection
        group.MapPost("/", async (ConnectionRequest request, IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.ConnectAsync(request);
            
            return result.Success 
                ? Results.Ok(result.Data) 
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateConnection")
        .WithSummary("Create a new Service Bus connection")
        .WithDescription("Connects to the specified Service Bus entity (queue or topic with optional subscription)")
        .Produces<ConnectionInfo>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // GET /api/connections/current - Get current connection info
        group.MapGet("/current", (IServiceBusService serviceBusService) =>
        {
            if (!serviceBusService.IsConnected || serviceBusService.CurrentConnection == null)
            {
                return Results.NotFound(new { error = "No active connection" });
            }

            return Results.Ok(serviceBusService.CurrentConnection);
        })
        .WithName("GetCurrentConnection")
        .WithSummary("Get current connection information")
        .WithDescription("Returns information about the currently active Service Bus connection")
        .Produces<ConnectionInfo>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/connections/current - Disconnect
        group.MapDelete("/current", async (IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.DisconnectAsync();
            
            return result.Success 
                ? Results.Ok(new { message = "Disconnected successfully" }) 
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("Disconnect")
        .WithSummary("Disconnect from current Service Bus connection")
        .WithDescription("Closes the current Service Bus connection and releases resources")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // GET /api/connections/entities - Get available entities
        group.MapGet("/entities", async (IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.GetEntitiesAsync();
            
            return result.Success 
                ? Results.Ok(result.Data) 
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetEntities")
        .WithSummary("Get available entities")
        .WithDescription("Returns a list of available queues and topics")
        .Produces<string[]>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // GET /api/connections/defaults - Get emulator defaults
        group.MapGet("/defaults", () =>
        {
            return Results.Ok(new
            {
                connectionString = EmulatorDefaults.DefaultConnectionString,
                host = EmulatorDefaults.EmulatorHost,
                commonQueues = EmulatorDefaults.CommonTestQueues,
                commonTopics = EmulatorDefaults.CommonTestTopics
            });
        })
        .WithName("GetEmulatorDefaults")
        .WithSummary("Get emulator default values")
        .WithDescription("Returns default connection string and common entity names for the Azure Service Bus Emulator")
        .Produces(StatusCodes.Status200OK);

        // GET /api/connections/scenarios - Get configuration scenarios
        group.MapGet("/scenarios", (IConfiguration configuration) =>
        {
            return Results.Ok(EmulatorDefaults.GetConfigurationScenarios(configuration));
        })
        .WithName("GetConfigurationScenarios")
        .WithSummary("Get configuration scenarios")
        .WithDescription("Returns available configuration scenarios for different deployment environments, including custom configurations")
        .Produces<EmulatorConfigurationScenario[]>(StatusCodes.Status200OK);
    }
}