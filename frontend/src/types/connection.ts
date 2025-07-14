export interface ConnectionRequest {
  connectionString: string;
  entityName?: string;
  subscriptionName?: string;
}

export interface ConnectionInfo {
  host: string;
  entityType: 'Queue' | 'Topic';
  entityName: string;
  subscriptionName?: string;
  isConnected: boolean;
  isEmulator: boolean;
}

export interface EmulatorConfig {
  autoConnect: boolean;
  defaultQueues: string[];
  defaultTopics: string[];
  testDataTemplates: MessageTemplate[];
}

export interface MessageTemplate {
  name: string;
  body: string;
  contentType: string;
  properties: Record<string, unknown>;
}

export interface EmulatorDefaults {
  connectionString: string;
  host: string;
  commonQueues: string[];
  commonTopics: string[];
}

export interface EmulatorConfigurationScenario {
  name: string;
  description: string;
  connectionString: string;
  host: string;
  commonQueues: string[];
  commonTopics: string[];
}