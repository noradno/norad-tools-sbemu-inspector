import { ConnectionRequest, ConnectionInfo, EmulatorDefaults, EmulatorConfigurationScenario } from '@/types/connection';
import { Message, PeekedMessageInfo, SendMessageRequest } from '@/types/message';
import { PagedResponse, BulkOperationResult } from '@/types/api';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

// Connection API
export const connectionApi = {
  async connect(request: ConnectionRequest): Promise<ConnectionInfo> {
    return apiCall<ConnectionInfo>('/connections', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getCurrentConnection(): Promise<ConnectionInfo> {
    return apiCall<ConnectionInfo>('/connections/current');
  },

  async disconnect(): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/connections/current', {
      method: 'DELETE',
    });
  },

  async getEntities(): Promise<string[]> {
    return apiCall<string[]>('/connections/entities');
  },

  async getDefaults(): Promise<EmulatorDefaults> {
    return apiCall<EmulatorDefaults>('/connections/defaults');
  },

  async getScenarios(): Promise<EmulatorConfigurationScenario[]> {
    return apiCall<EmulatorConfigurationScenario[]>('/connections/scenarios');
  },
};

// Message API
export const messageApi = {
  async peekMessages(maxMessages: number = 100): Promise<PagedResponse<PeekedMessageInfo>> {
    return apiCall<PagedResponse<PeekedMessageInfo>>(`/messages/peek?maxMessages=${maxMessages}`);
  },

  async getMessage(messageId: string): Promise<Message> {
    return apiCall<Message>(`/messages/${encodeURIComponent(messageId)}`);
  },

  async receiveMessage(): Promise<Message | { message: string }> {
    return apiCall<Message | { message: string }>('/messages/receive', {
      method: 'POST',
    });
  },

  async sendMessage(request: SendMessageRequest): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async bulkSendMessages(requests: SendMessageRequest[]): Promise<BulkOperationResult> {
    return apiCall<BulkOperationResult>('/messages/bulk-send', {
      method: 'POST',
      body: JSON.stringify(requests),
    });
  },
};

// Health API
export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiCall<{ status: string; timestamp: string }>('/health');
  },
};

export { ApiError };