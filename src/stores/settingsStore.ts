import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Settings, ThemeColor } from '@/types';

export type MusicPlayerMode = 'collapsed' | 'mini' | 'expanded';

export interface MusicPlayerPosition {
  x: number;
  y: number;
}

interface SettingsState extends Settings {
  // Music state
  musicEnabled: boolean;
  currentPlaylistId: string | null;
  musicVolume: number;
  musicPlayerPosition: MusicPlayerPosition | null;
  musicPlayerMode: MusicPlayerMode;
  // Actions
  setUserName: (name: string) => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleMusic: () => void;
  setMusicEnabled: (enabled: boolean) => void;
  setPlaylist: (id: string | null) => void;
  setMusicVolume: (volume: number) => void;
  setMusicPlayerPosition: (position: MusicPlayerPosition | null) => void;
  setMusicPlayerMode: (mode: MusicPlayerMode) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const defaultSettings: Settings & {
  musicEnabled: boolean;
  currentPlaylistId: string | null;
  musicVolume: number;
  musicPlayerPosition: MusicPlayerPosition | null;
  musicPlayerMode: MusicPlayerMode;
} = {
  userName: '',
  themeColor: 'gold',
  soundEnabled: true,
  hasCompletedOnboarding: false,
  musicEnabled: false,
  currentPlaylistId: null,
  musicVolume: 50,
  musicPlayerPosition: null,
  musicPlayerMode: 'collapsed',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setUserName: (name) => {
        set({ userName: name });
      },

      setThemeColor: (color) => {
        set({ themeColor: color });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
      },

      setPlaylist: (id) => {
        set({ currentPlaylistId: id });
      },

      setMusicVolume: (volume) => {
        set({ musicVolume: Math.max(0, Math.min(100, volume)) });
      },

      setMusicPlayerPosition: (position) => {
        set({ musicPlayerPosition: position });
      },

      setMusicPlayerMode: (mode) => {
        set({ musicPlayerMode: mode });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'countdown-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Theme color mapping for CSS variables
export const themeColorMap: Record<ThemeColor, { primary: string; gradient: string }> = {
  gold: {
    primary: '#ffd700',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
  },
  purple: {
    primary: '#9333ea',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
  },
  cyan: {
    primary: '#06b6d4',
    gradient: 'from-cyan-400 via-teal-500 to-emerald-500',
  },
  magenta: {
    primary: '#ec4899',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  green: {
    primary: '#22c55e',
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
  },
};
