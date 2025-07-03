import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface UIStore {
  isSendFormOpen: boolean;
  theme: Theme;
  sidebarCollapsed: boolean;
  toggleSendForm: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isSendFormOpen: false,
  theme: 'system',
  sidebarCollapsed: false,

  toggleSendForm: () => set((state) => ({ isSendFormOpen: !state.isSendFormOpen })),
  
  setTheme: (theme: Theme) => {
    set({ theme });
    
    // Apply theme to document
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
}));