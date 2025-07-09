import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConnectionInfo, ConnectionRequest } from '@/types/connection';
import { connectionApi } from '@/services/api';

interface ConnectionStore {
  connection: ConnectionInfo | null;
  isConnecting: boolean;
  error: string | null;
  connect: (request: ConnectionRequest) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      connection: null,
      isConnecting: false,
      error: null,

      connect: async (request: ConnectionRequest) => {
        try {
          set({ isConnecting: true, error: null });
          const connection = await connectionApi.connect(request);
          set({ connection, isConnecting: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to connect',
            isConnecting: false 
          });
          throw error;
        }
      },

      disconnect: async () => {
        try {
          set({ isConnecting: true, error: null });
          await connectionApi.disconnect();
          set({ connection: null, isConnecting: false });
          
          // Clear persisted connection from localStorage
          localStorage.removeItem('sbemu-connection-store');
          
          // Call cleanup methods from other stores
          // Note: We can't directly import here due to circular dependency
          // So we'll rely on the calling component to handle cleanup
          
          // Clean up localStorage for messages if needed
          localStorage.removeItem('sbemu-message-store');
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to disconnect',
            isConnecting: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sbemu-connection-store',
      partialize: (state) => ({
        connection: state.connection,
      }),
    }
  )
);