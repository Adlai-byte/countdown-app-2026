import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Resolution {
  id: string;
  text: string;
  templateId: string;
  dataUrl?: string; // Generated card image
  createdAt: string;
}

interface ResolutionState {
  resolutions: Resolution[];
  addResolution: (resolution: Omit<Resolution, 'id' | 'createdAt'>) => void;
  updateResolution: (id: string, updates: Partial<Resolution>) => void;
  deleteResolution: (id: string) => void;
  clearAll: () => void;
}

export const useResolutionStore = create<ResolutionState>()(
  persist(
    (set) => ({
      resolutions: [],

      addResolution: (resolution) =>
        set((state) => ({
          resolutions: [
            {
              ...resolution,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.resolutions,
          ],
        })),

      updateResolution: (id, updates) =>
        set((state) => ({
          resolutions: state.resolutions.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteResolution: (id) =>
        set((state) => ({
          resolutions: state.resolutions.filter((r) => r.id !== id),
        })),

      clearAll: () => set({ resolutions: [] }),
    }),
    {
      name: 'resolution-storage',
      partialize: (state) => ({ resolutions: state.resolutions }),
    }
  )
);
