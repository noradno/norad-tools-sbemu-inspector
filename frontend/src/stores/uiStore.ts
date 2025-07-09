import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '@/types/message';

type Theme = 'light' | 'dark' | 'system';

interface UIStore {
  isSendFormOpen: boolean;
  theme: Theme;
  sidebarCollapsed: boolean;
  selectedMessage: Message | null;
  isMessageModalOpen: boolean;
  toggleSendForm: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  openMessageModal: (message: Message) => void;
  closeMessageModal: () => void;
  resetTransientState: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSendFormOpen: false,
      theme: 'system',
      sidebarCollapsed: false,
      selectedMessage: null,
      isMessageModalOpen: false,

      toggleSendForm: () => set((state) => ({ isSendFormOpen: !state.isSendFormOpen })),
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      openMessageModal: (message: Message) => set({ selectedMessage: message, isMessageModalOpen: true }),
      
      closeMessageModal: () => set({ selectedMessage: null, isMessageModalOpen: false }),
      
      resetTransientState: () => {
        set({ 
          selectedMessage: null, 
          isMessageModalOpen: false,
          isSendFormOpen: false
        });
      },
    }),
    {
      name: 'sbemu-ui-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        isSendFormOpen: state.isSendFormOpen,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (state.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(state.theme);
          }
        }
      },
    }
  )
);