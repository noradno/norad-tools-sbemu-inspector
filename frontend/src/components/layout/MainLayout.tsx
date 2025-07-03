import { useConnectionStore } from '@/stores/connectionStore';
import { ConnectionForm } from '@/components/connection/ConnectionForm';
import { MessageList } from '@/components/messages/MessageList';
import { SendMessageForm } from '@/components/messages/SendMessageForm';
import { useUIStore } from '@/stores/uiStore';

export function MainLayout() {
  const { connection } = useConnectionStore();
  const { isSendFormOpen } = useUIStore();

  if (!connection?.isConnected) {
    return (
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Connect to Service Bus</h2>
            <p className="text-muted-foreground">
              Connect to Azure Service Bus Emulator to start inspecting messages
            </p>
          </div>
          <ConnectionForm />
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <MessageList />
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {isSendFormOpen && <SendMessageForm />}
          
          {/* Connection Info */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Connection Details</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Host:</span> {connection.host}
              </div>
              <div>
                <span className="text-muted-foreground">Entity:</span> {connection.entityName}
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span> {connection.entityType}
              </div>
              {connection.subscriptionName && (
                <div>
                  <span className="text-muted-foreground">Subscription:</span> {connection.subscriptionName}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}