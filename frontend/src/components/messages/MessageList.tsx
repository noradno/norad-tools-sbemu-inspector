import { useEffect, useState } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, Download, Trash2, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { MessageViewModal } from './MessageViewModal';
import { messageApi } from '@/services/api';
import { toast } from 'sonner';

export function MessageList() {
  const { messages, isLoading, peekMessages, receiveMessage } = useMessageStore();
  const { connection, isApiOnline } = useConnectionStore();
  const { selectedMessage, isMessageModalOpen, openMessageModal, closeMessageModal } = useUIStore();
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (connection?.isConnected && isApiOnline) {
      peekMessages().catch(() => {
        // Error is already handled in the store with toast
      });
    }
  }, [connection?.isConnected, isApiOnline, peekMessages]);

  const handleRefresh = async () => {
    if (!isApiOnline) {
      toast.warning('Cannot refresh messages: API is offline');
      return;
    }
    try {
      await peekMessages();
    } catch (error) {
      // Error is already handled in the store with toast
    }
  };

  const handleReceiveMessage = async () => {
    if (!isApiOnline) {
      toast.warning('Cannot receive messages: API is offline');
      return;
    }
    try {
      await receiveMessage();
    } catch (error) {
      // Error is already handled in the store with toast
    }
  };

  const handleViewMessage = async (messageId: string) => {
    if (!isApiOnline) {
      toast.warning('Cannot view message details: API is offline');
      return;
    }
    try {
      setLoadingMessageId(messageId);
      const fullMessage = await messageApi.getMessage(messageId);
      openMessageModal(fullMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch message details');
    } finally {
      setLoadingMessageId(null);
    }
  };

  if (!connection?.isConnected) {
    return null;
  }

  return (
    <>
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
                disabled={isLoading || !isApiOnline}
                title={!isApiOnline ? 'API is offline' : 'Refresh messages'}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReceiveMessage}
                disabled={isLoading || messages.length === 0 || !isApiOnline}
                title={!isApiOnline ? 'API is offline' : 'Receive message'}
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewMessage(message.messageId)}
                      disabled={loadingMessageId === message.messageId || !isApiOnline}
                      title={!isApiOnline ? 'API is offline' : 'View message details'}
                    >
                      {loadingMessageId === message.messageId ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </>
                      )}
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
      
      <MessageViewModal 
        message={selectedMessage}
        open={isMessageModalOpen}
        onOpenChange={closeMessageModal}
      />
    </>
  );
}