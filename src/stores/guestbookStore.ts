import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestMessage {
  id: string;
  type: 'text' | 'drawing';
  content: string; // Text message or dataURL for drawing
  author: string;
  createdAt: string;
}

interface GuestbookState {
  messages: GuestMessage[];
  addMessage: (message: Omit<GuestMessage, 'id' | 'createdAt'>) => void;
  deleteMessage: (id: string) => void;
  clearAll: () => void;
}

export const useGuestbookStore = create<GuestbookState>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (message) =>
        set((state) => ({
          messages: [
            {
              ...message,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.messages,
          ],
        })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),

      clearAll: () => set({ messages: [] }),
    }),
    {
      name: 'guestbook-storage',
      // Only persist the messages array
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
