namespace SBEmuInspector.Api.Models;

/// <summary>Message data transfer object</summary>
public record MessageDto(
    string MessageId,
    string Body,
    string ContentType,
    DateTimeOffset EnqueuedTime,
    Dictionary<string, object> ApplicationProperties,
    long SequenceNumber,
    string? SessionId,
    TimeSpan? TimeToLive);

/// <summary>Request model for sending a message</summary>
public record SendMessageRequest(
    string Body,
    string? ContentType,
    Dictionary<string, object>? ApplicationProperties,
    TimeSpan? TimeToLive,
    DateTimeOffset? ScheduledEnqueueTime);

/// <summary>Information about a peeked message</summary>
public record PeekedMessageInfo(
    string MessageId,
    DateTimeOffset EnqueuedTime,
    long SequenceNumber,
    string? SessionId);

/// <summary>Generic operation result</summary>
public record OperationResult<T>(bool Success, T? Data, string? Error);

/// <summary>Paged result for collections</summary>
public record PagedResult<T>(T[] Items, int TotalCount, bool HasMore);