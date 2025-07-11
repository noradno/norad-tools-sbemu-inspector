import { useUIStore } from '@/stores/uiStore';

export function useTheme() {
  const theme = useUIStore((state) => state.theme);
  
  return { theme };
}