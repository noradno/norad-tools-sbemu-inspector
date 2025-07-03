import { useConnectionStore } from '@/stores/connectionStore';
import { useUIStore } from '@/stores/uiStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Sun, Moon, Settings, Wifi, WifiOff } from 'lucide-react';

export function Header() {
  const { connection } = useConnectionStore();
  const { theme, setTheme, toggleSendForm } = useUIStore();

  const isConnected = connection?.isConnected || false;
  const isEmulator = connection?.isEmulator || false;

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Service Bus Emulator Inspector</h1>
          {isEmulator && (
            <Badge variant="emulator" className="animate-pulse-slow">
              EMULATOR MODE
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? `${connection?.entityName} @ ${connection?.host}` : 'Not connected'}
            </span>
          </div>

          {/* Actions */}
          {isConnected && (
            <Button onClick={toggleSendForm} size="sm">
              Send Message
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}