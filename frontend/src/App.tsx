import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '@/stores/uiStore';
import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApiHealthCheck } from '@/hooks/useApiHealthCheck';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { theme, setTheme } = useUIStore();
  
  // Monitor API health
  useApiHealthCheck();

  useEffect(() => {
    // Initialize theme
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <MainLayout />
        <Toaster position="top-center"/>
      </div>
    </QueryClientProvider>
  );
}

export default App;