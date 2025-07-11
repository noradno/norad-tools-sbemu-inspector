import { useState, useEffect } from 'react';
import { useConnectionStore } from '@/stores/connectionStore';
import { connectionApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plug, Server } from 'lucide-react';

export function ConnectionForm() {
  const [connectionString, setConnectionString] = useState('');
  const [entityName, setEntityName] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');
  const [availableEntities, setAvailableEntities] = useState<string[]>([]);
  const [showDefaults, setShowDefaults] = useState(false);
  
  const { connect, isConnecting, error, clearError, isApiOnline } = useConnectionStore();

  useEffect(() => {
    // Load emulator defaults
    connectionApi.getDefaults().then(defaults => {
      setConnectionString(defaults.connectionString);
      setAvailableEntities([...defaults.commonQueues, ...defaults.commonTopics]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await connect({
        connectionString,
        entityName: entityName || undefined,
        subscriptionName: subscriptionName || undefined,
      });
    } catch (error) {
      // Error is already handled by the store
      console.error('Connection failed:', error);
    }
  };

  const handleEntitySelect = (entity: string) => {
    setEntityName(entity);
    setShowDefaults(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Service Bus Connection
        </CardTitle>
        <CardDescription>
          Connect to Azure Service Bus Emulator to start inspecting messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isApiOnline && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              Cannot connect: API is offline. Please ensure the backend service is running.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <Input
              id="connectionString"
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="Endpoint=sb://localhost:5672;..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Default emulator connection string is pre-filled
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityName">Queue or Topic Name</Label>
            <div className="flex gap-2">
              <Input
                id="entityName"
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="my-queue or my-topic"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDefaults(!showDefaults)}
              >
                {showDefaults ? 'Hide' : 'Show'} Common
              </Button>
            </div>
            
            {showDefaults && (
              <div className="flex flex-wrap gap-2 mt-2">
                {availableEntities.map(entity => (
                  <Badge
                    key={entity}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleEntitySelect(entity)}
                  >
                    {entity}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionName">Subscription Name (Optional)</Label>
            <Input
              id="subscriptionName"
              type="text"
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
              placeholder="my-subscription (for topics only)"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isConnecting || !isApiOnline} className="w-full">
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}