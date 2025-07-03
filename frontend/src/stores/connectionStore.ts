import { create } from 'zustand';
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

export const useConnectionStore = create<ConnectionStore>((set) => ({
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
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to disconnect',
        isConnecting: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));