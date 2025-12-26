import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MemeStoreState {
  favorites: string[]; // Array of meme IDs
  sortBy: 'popular' | 'random';
  searchQuery: string;

  // Actions
  toggleFavorite: (memeId: string) => void;
  isFavorite: (memeId: string) => boolean;
  setSortBy: (sort: 'popular' | 'random') => void;
  setSearchQuery: (query: string) => void;
  clearFavorites: () => void;
}

export const useMemeStore = create<MemeStoreState>()(
  persist(
    (set, get) => ({
      favorites: [],
      sortBy: 'popular',
      searchQuery: '',

      toggleFavorite: (memeId) => {
        set((state) => ({
          favorites: state.favorites.includes(memeId)
            ? state.favorites.filter((id) => id !== memeId)
            : [...state.favorites, memeId],
        }));
      },

      isFavorite: (memeId) => {
        return get().favorites.includes(memeId);
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'meme-storage',
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
