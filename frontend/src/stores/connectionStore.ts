import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConnectionInfo, ConnectionRequest } from '@/types/connection';
import { connectionApi } from '@/services/api';
import { toast } from 'sonner';

interface ConnectionStore {
  connection: ConnectionInfo | null;
  isConnecting: boolean;
  error: string | null;
  isApiOnline: boolean;
  connect: (request: ConnectionRequest) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
  setApiOnline: (online: boolean) => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      connection: null,
      isConnecting: false,
      error: null,
      isApiOnline: true,

      connect: async (request: ConnectionRequest) => {
        try {
          set({ isConnecting: true, error: null });
          const connection = await connectionApi.connect(request);
          set({ connection, isConnecting: false });
          toast.success(`Connected to ${connection.entityName}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
          set({ 
            error: errorMessage,
            isConnecting: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      disconnect: async () => {
        try {
          set({ isConnecting: true, error: null });
          
          try {
            await connectionApi.disconnect();
          } catch (apiError) {
            console.warn('API disconnect failed:', apiError);
          }
          
          set({ connection: null, isConnecting: false });
          
          localStorage.removeItem('sbemu-connection-store');
          localStorage.removeItem('sbemu-message-store');
          
          toast.success('Disconnected successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect';
          set({ 
            error: errorMessage,
            isConnecting: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      setApiOnline: (online: boolean) => set({ isApiOnline: online }),
    }),
    {
      name: 'sbemu-connection-store',
      partialize: (state) => ({
        connection: state.connection,
      }),
    }
  )
);