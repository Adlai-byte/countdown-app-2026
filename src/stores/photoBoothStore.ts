import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FilterType = 'none' | 'warm' | 'cool' | 'vintage' | 'sparkle';
export type FrameType = 'none' | 'confetti' | 'fireworks' | 'newyear' | 'stars';
export type CaptureMode = 'single' | 'strip' | 'collage' | 'gif';
export type StickerType = string; // Sticker IDs from stickers.ts

export interface Photo {
  id: string;
  dataUrl: string;
  filter: FilterType;
  frame: FrameType;
  createdAt: string;
  mode?: CaptureMode;
}

export interface PhotoSession {
  id: string;
  mode: CaptureMode;
  shots: string[]; // dataUrls of individual shots
  currentShot: number;
  totalShots: number;
  isCapturing: boolean;
  startedAt: string;
}

export interface StickerPosition {
  x: number;
  y: number;
}

interface PhotoBoothState {
  photos: Photo[];
  selectedFilter: FilterType;
  selectedFrame: FrameType;
  selectedSticker: StickerType;
  stickerPosition: StickerPosition | null;
  captureMode: CaptureMode;
  currentSession: PhotoSession | null;

  // Filter/Frame actions
  setSelectedFilter: (filter: FilterType) => void;
  setSelectedFrame: (frame: FrameType) => void;
  setSelectedSticker: (sticker: StickerType) => void;
  setStickerPosition: (position: StickerPosition | null) => void;
  resetStickerPosition: () => void;

  // Photo actions
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  deletePhoto: (id: string) => void;
  clearPhotos: () => void;

  // Capture mode actions
  setCaptureMode: (mode: CaptureMode) => void;

  // Session actions
  startSession: () => void;
  addShotToSession: (dataUrl: string) => void;
  completeSession: (finalDataUrl: string) => void;
  cancelSession: () => void;
}

function getTotalShotsForMode(mode: CaptureMode): number {
  switch (mode) {
    case 'single': return 1;
    case 'strip': return 4;
    case 'collage': return 4;
    case 'gif': return 8;
    default: return 1;
  }
}

export const usePhotoBoothStore = create<PhotoBoothState>()(
  persist(
    (set, get) => ({
      photos: [],
      selectedFilter: 'none',
      selectedFrame: 'newyear',
      selectedSticker: 'none',
      stickerPosition: null,
      captureMode: 'single',
      currentSession: null,

      setSelectedFilter: (filter) => set({ selectedFilter: filter }),

      setSelectedFrame: (frame) => set({ selectedFrame: frame }),

      setSelectedSticker: (sticker) => set({ selectedSticker: sticker, stickerPosition: null }),

      setStickerPosition: (position) => set({ stickerPosition: position }),

      resetStickerPosition: () => set({ stickerPosition: null }),

      addPhoto: (photo) =>
        set((state) => ({
          photos: [
            {
              ...photo,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.photos,
          ],
        })),

      deletePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      clearPhotos: () => set({ photos: [] }),

      setCaptureMode: (mode) => set({ captureMode: mode }),

      startSession: () => {
        const { captureMode } = get();
        set({
          currentSession: {
            id: crypto.randomUUID(),
            mode: captureMode,
            shots: [],
            currentShot: 0,
            totalShots: getTotalShotsForMode(captureMode),
            isCapturing: true,
            startedAt: new Date().toISOString(),
          },
        });
      },

      addShotToSession: (dataUrl) => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            shots: [...currentSession.shots, dataUrl],
            currentShot: currentSession.currentShot + 1,
          },
        });
      },

      completeSession: (finalDataUrl) => {
        const { currentSession, selectedFilter, selectedFrame } = get();
        if (!currentSession) return;

        set((state) => ({
          photos: [
            {
              id: crypto.randomUUID(),
              dataUrl: finalDataUrl,
              filter: selectedFilter,
              frame: selectedFrame,
              createdAt: new Date().toISOString(),
              mode: currentSession.mode,
            },
            ...state.photos,
          ],
          currentSession: null,
        }));
      },

      cancelSession: () => set({ currentSession: null }),
    }),
    {
      name: 'photo-booth-storage',
      partialize: (state) => ({
        photos: state.photos,
        selectedFilter: state.selectedFilter,
        selectedFrame: state.selectedFrame,
        selectedSticker: state.selectedSticker,
        captureMode: state.captureMode,
      }),
    }
  )
);
