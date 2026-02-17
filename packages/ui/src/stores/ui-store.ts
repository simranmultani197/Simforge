import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'simforge-theme';

/** Read persisted theme from localStorage (safe for test envs). */
function getPersistedTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'system';
}

/** Apply the theme class to <html> so CSS `:root.dark` / `:root.light` works. */
function applyThemeToDOM(theme: ThemeMode): void {
  try {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme !== 'system') {
      root.classList.add(theme);
    }
  } catch {
    // document unavailable in test env
  }
}

interface UiState {
  /** Whether the component palette (left sidebar) is visible */
  showPalette: boolean;
  /** Whether the properties panel (right sidebar) is visible */
  showProperties: boolean;
  /** Whether the metrics bottom panel is open */
  metricsOpen: boolean;
  /** Theme preference (persisted to localStorage) */
  theme: ThemeMode;

  // Actions
  togglePalette: () => void;
  toggleProperties: () => void;
  toggleMetrics: () => void;
  setTheme: (theme: ThemeMode) => void;
}

// Hydrate theme on store creation
const initialTheme = getPersistedTheme();
applyThemeToDOM(initialTheme);

export const useUiStore = create<UiState>((set) => ({
  showPalette: true,
  showProperties: true,
  metricsOpen: false,
  theme: initialTheme,

  togglePalette: () => set((s) => ({ showPalette: !s.showPalette })),
  toggleProperties: () => set((s) => ({ showProperties: !s.showProperties })),
  toggleMetrics: () => set((s) => ({ metricsOpen: !s.metricsOpen })),
  setTheme: (theme) => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable
    }
    set({ theme });
  },
}));
