using SBEmuInspector.Api.Models;
using SBEmuInspector.Api.Services;

namespace SBEmuInspector.Api.Endpoints;

/// <summary>Extension methods for message-related endpoints</summary>
public static class MessageEndpoints
{
    /// <summary>Maps message-related endpoints</summary>
    public static void MapMessageEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/messages")
            .WithTags("Messages")
            .WithOpenApi();

        // GET /api/messages/peek - Peek messages
        group.MapGet("/peek", async (IServiceBusService serviceBusService, int maxMessages = 100) =>
        {
            var result = await serviceBusService.PeekMessagesAsync(maxMessages);
            
            return result.Success 
                ? Results.Ok(result.Data) 
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("PeekMessages")
        .WithSummary("Peek messages from the queue or topic")
        .WithDescription("Returns a list of messages without removing them from the queue or topic")
        .Produces<PagedResult<PeekedMessageInfo>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // GET /api/messages/{messageId} - Get specific message details
        group.MapGet("/{messageId}", async (string messageId, IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.PeekMessageAsync(messageId);
            
            if (!result.Success)
            {
                return Results.BadRequest(new { error = result.Error });
            }

            return result.Data != null 
                ? Results.Ok(result.Data) 
                : Results.NotFound(new { error = "Message not found" });
        })
        .WithName("GetMessage")
        .WithSummary("Get specific message details")
        .WithDescription("Returns detailed information about a specific message by ID")
        .Produces<MessageDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status400BadRequest);

        // POST /api/messages/receive - Receive and complete message
        group.MapPost("/receive", async (IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.ReceiveMessageAsync();
            
            if (!result.Success)
            {
                return Results.BadRequest(new { error = result.Error });
            }

            return result.Data != null 
                ? Results.Ok(result.Data) 
                : Results.Ok(new { message = "No messages available" });
        })
        .WithName("ReceiveMessage")
        .WithSummary("Receive and complete a message")
        .WithDescription("Receives a message from the queue or topic and marks it as completed")
        .Produces<MessageDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // POST /api/messages/send - Send new message
        group.MapPost("/send", async (SendMessageRequest request, IServiceBusService serviceBusService) =>
        {
            var result = await serviceBusService.SendMessageAsync(request);
            
            return result.Success 
                ? Results.Ok(new { message = "Message sent successfully" }) 
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("SendMessage")
        .WithSummary("Send a new message")
        .WithDescription("Sends a new message to the connected queue or topic")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // POST /api/messages/bulk-send - Send multiple messages
        group.MapPost("/bulk-send", async (SendMessageRequest[] requests, IServiceBusService serviceBusService) =>
        {
            var results = new List<string>();
            var errors = new List<string>();

            foreach (var request in requests)
            {
                var result = await serviceBusService.SendMessageAsync(request);
                if (result.Success)
                {
                    results.Add("Message sent successfully");
                }
                else
                {
                    errors.Add(result.Error ?? "Unknown error");
                }
            }

            return Results.Ok(new { 
                successful = results.Count, 
                failed = errors.Count, 
                errors = errors.Take(10).ToArray() // Limit errors to prevent large responses
            });
        })
        .WithName("BulkSendMessages")
        .WithSummary("Send multiple messages")
        .WithDescription("Sends multiple messages to the connected queue or topic")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);
    }
}