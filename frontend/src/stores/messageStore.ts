import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, PeekedMessageInfo, SendMessageRequest, MessageFilters } from '@/types/message';
import { messageApi } from '@/services/api';

interface MessageStore {
  messages: PeekedMessageInfo[];
  selectedMessage: Message | null;
  isLoading: boolean;
  filters: MessageFilters;
  peekMessages: (count?: number) => Promise<void>;
  receiveMessage: () => Promise<Message | null>;
  sendMessage: (message: SendMessageRequest) => Promise<void>;
  setSelectedMessage: (message: Message | null) => void;
  updateFilters: (filters: Partial<MessageFilters>) => void;
  clearMessages: () => void;
  resetStore: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [],
      selectedMessage: null,
      isLoading: false,
      filters: {},

      peekMessages: async (count = 100) => {
        try {
          set({ isLoading: true });
          const response = await messageApi.peekMessages(count);
          set({ messages: response.items, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      receiveMessage: async () => {
        try {
          set({ isLoading: true });
          const response = await messageApi.receiveMessage();
          set({ isLoading: false });
          
          if ('messageId' in response) {
            await get().peekMessages();
            return response as Message;
          }
          return null;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      sendMessage: async (message: SendMessageRequest) => {
        try {
          set({ isLoading: true });
          await messageApi.sendMessage(message);
          set({ isLoading: false });
          
          await get().peekMessages();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setSelectedMessage: (message: Message | null) => {
        set({ selectedMessage: message });
      },

      updateFilters: (filters: Partial<MessageFilters>) => {
        set(state => ({ filters: { ...state.filters, ...filters } }));
      },

      clearMessages: () => {
        set({ messages: [], selectedMessage: null });
      },

      resetStore: () => {
        set({ 
          messages: [], 
          selectedMessage: null, 
          isLoading: false,
          filters: {}
        });
      },
    }),
    {
      name: 'sbemu-message-store',
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);