import { useState, useEffect } from 'react';
import { EmulatorConfigurationScenario } from '@/types/connection';
import { connectionApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Server, Container, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigurationScenariosProps {
  onScenarioSelect: (scenario: EmulatorConfigurationScenario) => void;
  selectedConnectionString?: string;
}

export function ConfigurationScenarios({ onScenarioSelect, selectedConnectionString }: ConfigurationScenariosProps) {
  const [scenarios, setScenarios] = useState<EmulatorConfigurationScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const data = await connectionApi.getScenarios();
        setScenarios(data);
      } catch (error) {
        toast.error('Failed to load configuration scenarios');
        console.error('Failed to load scenarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const getScenarioIcon = (name: string) => {
    if (name.includes('Local')) return <Monitor className="h-5 w-5" />;
    if (name.includes('Docker to Host')) return <Server className="h-5 w-5" />;
    if (name.includes('Both in Docker')) return <Container className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const isScenarioSelected = (scenario: EmulatorConfigurationScenario) => {
    return selectedConnectionString === scenario.connectionString;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration Scenarios</CardTitle>
          <CardDescription>Loading available configurations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration Scenarios</CardTitle>
          <CardDescription>No configuration scenarios available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Setup</CardTitle>
        <CardDescription>
          Choose your deployment scenario to automatically configure the connection string
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isScenarioSelected(scenario) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onScenarioSelect(scenario)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getScenarioIcon(scenario.name)}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {scenario.name}
                      {isScenarioSelected(scenario) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {scenario.host}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scenario.commonQueues.length} queues
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scenario.commonTopics.length} topics
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant={isScenarioSelected(scenario) ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScenarioSelect(scenario);
                  }}
                >
                  {isScenarioSelected(scenario) ? 'Selected' : 'Use This'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Need help choosing?</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• <strong>Local Development:</strong> Both Inspector and Emulator running on your machine</li>
                <li>• <strong>Docker to Host:</strong> Inspector in Docker, Emulator on your host machine</li>
                <li>• <strong>Both in Docker:</strong> Both services running in containers (use container name)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}