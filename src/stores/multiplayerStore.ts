import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Room, Player, GameType, RoomSettings } from '@/services/multiplayer/types';

interface MultiplayerState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Room state
  currentRoom: Room | null;
  currentPlayerId: string | null;
  players: Player[];

  // Local player preferences (persisted)
  localPlayerName: string;
  localAvatarColor: string;
  localAvatarEmoji: string;

  // Live visitor count
  visitorCount: number;

  // Computed helpers
  isHost: boolean;
  currentPlayer: Player | null;

  // Actions
  setRoom: (room: Room | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  updateGameState: (gameState: Record<string, unknown>) => void;
  updateRoomStatus: (status: Room['status']) => void;
  updateRoomSettings: (settings: Partial<RoomSettings>) => void;
  setGameType: (gameType: GameType | null) => void;
  setConnectionStatus: (connected: boolean, error?: string | null) => void;
  setCurrentPlayerId: (playerId: string | null) => void;
  setLocalPlayerInfo: (name: string, color: string, emoji: string) => void;
  setVisitorCount: (count: number) => void;
  reset: () => void;
}

const DEFAULT_AVATAR_COLORS = [
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
];

const DEFAULT_AVATAR_EMOJIS = [
  '😀', '😎', '🥳', '🤩', '😇', '🤠', '🦄', '🐱', '🐶', '🦊', '🐸', '🎉',
];

const getRandomAvatarColor = () =>
  DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)];

const getRandomAvatarEmoji = () =>
  DEFAULT_AVATAR_EMOJIS[Math.floor(Math.random() * DEFAULT_AVATAR_EMOJIS.length)];

export const useMultiplayerStore = create<MultiplayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connectionError: null,
      currentRoom: null,
      currentPlayerId: null,
      players: [],
      localPlayerName: '',
      localAvatarColor: getRandomAvatarColor(),
      localAvatarEmoji: getRandomAvatarEmoji(),
      visitorCount: 0,

      // Computed (updated via actions)
      isHost: false,
      currentPlayer: null,

      // Actions
      setRoom: (room) => {
        set({ currentRoom: room });
        // Update isHost when room changes
        const state = get();
        if (room && state.currentPlayerId) {
          set({ isHost: room.host_id === state.currentPlayerId });
        }
      },

      setPlayers: (players) => {
        set({ players });
        // Update currentPlayer and isHost
        const state = get();
        const currentPlayer = players.find((p) => p.id === state.currentPlayerId) || null;
        set({
          currentPlayer,
          isHost: currentPlayer?.is_host || false,
        });
      },

      addPlayer: (player) => {
        set((state) => ({
          players: [...state.players, player],
        }));
      },

      removePlayer: (playerId) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        }));
      },

      updatePlayer: (playerId, updates) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
        }));
        // Update currentPlayer if it's the current player
        const state = get();
        if (playerId === state.currentPlayerId) {
          const currentPlayer = state.players.find((p) => p.id === playerId);
          if (currentPlayer) {
            set({
              currentPlayer: { ...currentPlayer, ...updates },
              isHost: updates.is_host ?? currentPlayer.is_host,
            });
          }
        }
      },

      updateGameState: (gameState) => {
        set((state) => ({
          currentRoom: state.currentRoom
            ? { ...state.currentRoom, game_state: gameState }
            : null,
        }));
      },

      updateRoomStatus: (status) => {
        set((state) => ({
          currentRoom: state.currentRoom
            ? { ...state.currentRoom, status }
            : null,
        }));
      },

      updateRoomSettings: (settings) => {
        set((state) => ({
          currentRoom: state.currentRoom
            ? {
                ...state.currentRoom,
                settings: { ...state.currentRoom.settings, ...settings },
              }
            : null,
        }));
      },

      setGameType: (gameType) => {
        set((state) => ({
          currentRoom: state.currentRoom
            ? { ...state.currentRoom, game_type: gameType }
            : null,
        }));
      },

      setConnectionStatus: (connected, error = null) => {
        set({ isConnected: connected, connectionError: error });
      },

      setCurrentPlayerId: (playerId) => {
        set({ currentPlayerId: playerId });
        // Update currentPlayer and isHost
        const state = get();
        const currentPlayer = state.players.find((p) => p.id === playerId) || null;
        set({
          currentPlayer,
          isHost: currentPlayer?.is_host || false,
        });
      },

      setLocalPlayerInfo: (name, color, emoji) => {
        set({
          localPlayerName: name,
          localAvatarColor: color,
          localAvatarEmoji: emoji,
        });
      },

      setVisitorCount: (count) => {
        set({ visitorCount: count });
      },

      reset: () => {
        set({
          isConnected: false,
          connectionError: null,
          currentRoom: null,
          currentPlayerId: null,
          players: [],
          isHost: false,
          currentPlayer: null,
        });
      },
    }),
    {
      name: 'multiplayer-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist local player preferences, not room state
      partialize: (state) => ({
        localPlayerName: state.localPlayerName,
        localAvatarColor: state.localAvatarColor,
        localAvatarEmoji: state.localAvatarEmoji,
      }),
    }
  )
);

// Selector hooks for common patterns
export const useIsInRoom = () => useMultiplayerStore((state) => state.currentRoom !== null);
export const useIsHost = () => useMultiplayerStore((state) => state.isHost);
export const useCurrentRoom = () => useMultiplayerStore((state) => state.currentRoom);
export const usePlayers = () => useMultiplayerStore((state) => state.players);
export const useCurrentPlayer = () => useMultiplayerStore((state) => state.currentPlayer);
export const useGameState = <T>() => useMultiplayerStore((state) => state.currentRoom?.game_state as T | undefined);
export const useVisitorCount = () => useMultiplayerStore((state) => state.visitorCount);

// Avatar options for UI
export const AVATAR_COLORS = DEFAULT_AVATAR_COLORS;
export const AVATAR_EMOJIS = DEFAULT_AVATAR_EMOJIS;
