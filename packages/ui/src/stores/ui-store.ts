import { create } from 'zustand';

interface UiState {
  /** Whether the component palette (left sidebar) is visible */
  showPalette: boolean;
  /** Whether the properties panel (right sidebar) is visible */
  showProperties: boolean;
  /** Whether the metrics bottom panel is open */
  metricsOpen: boolean;
  /** Theme preference */
  theme: 'system' | 'light' | 'dark';

  // Actions
  togglePalette: () => void;
  toggleProperties: () => void;
  toggleMetrics: () => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
}

export const useUiStore = create<UiState>((set) => ({
  showPalette: true,
  showProperties: true,
  metricsOpen: false,
  theme: 'system',

  togglePalette: () => set((s) => ({ showPalette: !s.showPalette })),
  toggleProperties: () => set((s) => ({ showProperties: !s.showProperties })),
  toggleMetrics: () => set((s) => ({ metricsOpen: !s.metricsOpen })),
  setTheme: (theme) => {
    // Update <html> class to force light/dark mode
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme !== 'system') {
      root.classList.add(theme);
    }
    set({ theme });
  },
}));
