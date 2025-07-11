import { useConnectionStore } from '@/stores/connectionStore';
import { useUIStore } from '@/stores/uiStore';
import { useMessageStore } from '@/stores/messageStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Sun, Moon, Settings, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { connection, disconnect, isConnecting, isApiOnline } = useConnectionStore();
  const { theme, setTheme, toggleSendForm, resetTransientState } = useUIStore();
  const { resetStore } = useMessageStore();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect? This will clear your current session.')) {
      try {
        setIsDisconnecting(true);
        await disconnect();
        
        // Clean up other stores
        resetStore();
        resetTransientState();
      } catch (error) {
        console.error('Failed to disconnect:', error);
      } finally {
        setIsDisconnecting(false);
      }
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
          {!isApiOnline && (
            <Badge variant="destructive" className="animate-pulse">
              API OFFLINE
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected && isApiOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? (
                isApiOnline ? `${connection?.entityName} @ ${connection?.host}` : `${connection?.entityName} @ ${connection?.host} (API Offline)`
              ) : 'Not connected'}
            </span>
          </div>

          {/* Actions */}
          {isConnected && (
            <>
              <Button onClick={toggleSendForm} size="sm">
                Send Message
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnect}
                disabled={isConnecting || isDisconnecting}
                title="Disconnect from Service Bus"
              >
                {isDisconnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600 mr-2"></div>
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </>
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