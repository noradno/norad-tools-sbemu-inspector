import { Message } from '@/types/message';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/utils/formatters';
import { Calendar, Hash, Clock, Package, FileText, Key } from 'lucide-react';

interface MessageViewModalProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageViewModal({ message, open, onOpenChange }: MessageViewModalProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Message Details
          </DialogTitle>
          <DialogDescription>
            Message ID: {message.messageId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Message Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sequence:</span>
                <Badge variant="outline">#{message.sequenceNumber}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Enqueued:</span>
                <span>{formatRelativeTime(message.enqueuedTime)}</span>
              </div>
              {message.sessionId && (
                <div className="flex items-center gap-2 col-span-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Session ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{message.sessionId}</code>
                </div>
              )}
              {message.deliveryCount !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Delivery Count:</span>
                  <Badge variant={message.deliveryCount > 1 ? "destructive" : "default"}>
                    {message.deliveryCount}
                  </Badge>
                </div>
              )}
              {message.timeToLive && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">TTL:</span>
                  <span>{message.timeToLive}</span>
                </div>
              )}
              {message.lockedUntil && (
                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-muted-foreground">Locked Until:</span>
                  <span>{new Date(message.lockedUntil).toLocaleString()}</span>
                </div>
              )}
              {message.deadLetterReason && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Dead Letter Reason:</span>
                  <p className="text-destructive mt-1">{message.deadLetterReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Message Content</h3>
              <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                {message.contentType || 'text/plain'}
              </Badge>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                {typeof message.body === 'string' 
                  ? message.body 
                  : JSON.stringify(message.body, null, 2)}
              </pre>
            </div>
          </div>

          {/* Application Properties */}
          {message.applicationProperties && Object.keys(message.applicationProperties).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Application Properties</h3>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                  {JSON.stringify(message.applicationProperties, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}