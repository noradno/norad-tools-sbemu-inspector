export interface Message {
  messageId: string;
  body: string;
  contentType: string;
  enqueuedTime: string;
  applicationProperties: Record<string, unknown>;
  sequenceNumber: number;
  sessionId?: string;
  timeToLive?: string;
  deliveryCount?: number;
  lockedUntil?: string;
  deadLetterReason?: string;
}

export interface PeekedMessageInfo {
  messageId: string;
  enqueuedTime: string;
  sequenceNumber: number;
  sessionId?: string;
}

export interface SendMessageRequest {
  body: string;
  contentType?: string;
  applicationProperties?: Record<string, unknown>;
  timeToLive?: string;
  scheduledEnqueueTime?: string;
}

export interface MessageFilters {
  searchTerm?: string;
  contentType?: string;
  propertyFilters?: Record<string, string>;
  dateRange?: {
    from: Date;
    to: Date;
  };
  showDeadLettered?: boolean;
}