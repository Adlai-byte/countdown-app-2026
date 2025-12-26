import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CITIES } from '@/data/timezones';

interface TimezoneState {
  selectedCities: string[]; // Array of city IDs
  addCity: (cityId: string) => void;
  removeCity: (cityId: string) => void;
  toggleCity: (cityId: string) => void;
  reorderCities: (cities: string[]) => void;
  resetToDefaults: () => void;
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set, get) => ({
      selectedCities: DEFAULT_CITIES,

      addCity: (cityId) => {
        const { selectedCities } = get();
        if (!selectedCities.includes(cityId)) {
          set({ selectedCities: [...selectedCities, cityId] });
        }
      },

      removeCity: (cityId) => {
        const { selectedCities } = get();
        set({ selectedCities: selectedCities.filter(id => id !== cityId) });
      },

      toggleCity: (cityId) => {
        const { selectedCities, addCity, removeCity } = get();
        if (selectedCities.includes(cityId)) {
          removeCity(cityId);
        } else {
          addCity(cityId);
        }
      },

      reorderCities: (cities) => {
        set({ selectedCities: cities });
      },

      resetToDefaults: () => {
        set({ selectedCities: DEFAULT_CITIES });
      },
    }),
    {
      name: 'timezone-party-storage',
    }
  )
);
