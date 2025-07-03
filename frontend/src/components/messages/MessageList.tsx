import { useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, Download, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';

export function MessageList() {
  const { messages, isLoading, peekMessages, receiveMessage } = useMessageStore();
  const { connection } = useConnectionStore();

  useEffect(() => {
    if (connection?.isConnected) {
      peekMessages();
    }
  }, [connection?.isConnected, peekMessages]);

  const handleRefresh = () => {
    peekMessages();
  };

  const handleReceiveMessage = async () => {
    try {
      const message = await receiveMessage();
      if (message) {
        console.log('Received message:', message);
      }
    } catch (error) {
      console.error('Failed to receive message:', error);
    }
  };

  if (!connection?.isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Messages
            </CardTitle>
            <CardDescription>
              {messages.length} message{messages.length !== 1 ? 's' : ''} in {connection.entityName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReceiveMessage}
              disabled={isLoading || messages.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Receive
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages found</p>
            <p className="text-sm">Send a message to see it appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.messageId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                      {message.messageId.slice(0, 8)}...
                    </code>
                    <Badge variant="outline" className="text-xs">
                      #{message.sequenceNumber}
                    </Badge>
                    {message.sessionId && (
                      <Badge variant="secondary" className="text-xs">
                        Session: {message.sessionId}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enqueued {formatRelativeTime(message.enqueuedTime)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}