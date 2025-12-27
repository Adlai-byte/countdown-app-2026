import { useState, useCallback, useEffect, useRef } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayerStore';
import {
  roomService,
  subscribeToRoom,
  trackPlayerPresence,
  isSupabaseConfigured,
  getPlayerId,
} from '@/services/multiplayer';
import type { Room, Player, GameType, RoomSettings } from '@/services/multiplayer/types';

interface UseRoomReturn {
  // State
  room: Room | null;
  players: Player[];
  currentPlayer: Player | null;
  isHost: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Room actions
  createRoom: (playerName: string, avatarColor?: string, avatarEmoji?: string) => Promise<void>;
  joinRoom: (code: string, playerName: string, avatarColor?: string, avatarEmoji?: string) => Promise<void>;
  leaveRoom: () => Promise<void>;

  // Host actions
  kickPlayer: (playerId: string) => Promise<void>;
  transferHost: (playerId: string) => Promise<void>;
  updateSettings: (settings: Partial<RoomSettings>) => Promise<void>;
  startGame: (gameType: GameType, initialState?: Record<string, unknown>) => Promise<void>;
  endGame: () => Promise<void>;

  // Game state
  updateGameState: (gameState: Record<string, unknown>) => Promise<void>;

  // Utils
  isConfigured: boolean;
}

export function useRoom(): UseRoomReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const presenceUnsubscribeRef = useRef<(() => void) | null>(null);

  const {
    currentRoom,
    players,
    currentPlayer,
    isHost,
    isConnected,
    currentPlayerId,
    localAvatarColor,
    localAvatarEmoji,
    setRoom,
    setPlayers,
    setCurrentPlayerId,
    setConnectionStatus,
    updateGameState: updateStoreGameState,
    reset,
  } = useMultiplayerStore();

  const isConfigured = isSupabaseConfigured();

  // Subscribe to room updates when we have a room
  useEffect(() => {
    if (!currentRoom || !isConfigured) return;

    const subscription = subscribeToRoom(currentRoom.id, {
      onRoomUpdate: (updatedRoom) => {
        setRoom(updatedRoom);
      },
      onPlayersChange: (updatedPlayers) => {
        setPlayers(updatedPlayers);
      },
      onPlayerJoined: (player) => {
        console.log('Player joined:', player.name);
      },
      onPlayerLeft: ({ playerId }) => {
        console.log('Player left:', playerId);
      },
      onGameStateUpdate: (gameState) => {
        updateStoreGameState(gameState);
      },
      onError: (err) => {
        setError(err.message);
        setConnectionStatus(false, err.message);
      },
    });

    unsubscribeRef.current = subscription.unsubscribe;
    setConnectionStatus(true);

    // Track presence
    if (currentPlayerId && currentPlayer) {
      presenceUnsubscribeRef.current = trackPlayerPresence(
        currentRoom.id,
        currentPlayerId,
        currentPlayer.name,
        {
          onPresenceChange: (onlinePlayers) => {
            console.log('Online players:', onlinePlayers.length);
          },
        }
      );
    }

    return () => {
      unsubscribeRef.current?.();
      presenceUnsubscribeRef.current?.();
      setConnectionStatus(false);
    };
  }, [currentRoom?.id, currentPlayerId, isConfigured]);

  // Rejoin room on page load if player ID exists
  useEffect(() => {
    const rejoinRoom = async () => {
      const playerId = getPlayerId();
      if (!playerId || !isConfigured || currentRoom) return;

      // TODO: Implement rejoin logic by fetching player's room
    };

    rejoinRoom();
  }, [isConfigured]);

  const createRoom = useCallback(
    async (
      playerName: string,
      avatarColor = localAvatarColor,
      avatarEmoji = localAvatarEmoji
    ) => {
      if (!isConfigured) {
        setError('Multiplayer not configured');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await roomService.createRoom({
          playerName,
          avatarColor,
          avatarEmoji,
        });

        setRoom(result.room);
        setPlayers(result.players);
        setCurrentPlayerId(result.currentPlayer.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create room');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isConfigured, localAvatarColor, localAvatarEmoji]
  );

  const joinRoom = useCallback(
    async (
      code: string,
      playerName: string,
      avatarColor = localAvatarColor,
      avatarEmoji = localAvatarEmoji
    ) => {
      if (!isConfigured) {
        setError('Multiplayer not configured');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await roomService.joinRoom({
          code,
          playerName,
          avatarColor,
          avatarEmoji,
        });

        setRoom(result.room);
        setPlayers(result.players);
        setCurrentPlayerId(result.currentPlayer.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join room');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isConfigured, localAvatarColor, localAvatarEmoji]
  );

  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    setIsLoading(true);
    try {
      await roomService.leaveRoom(currentRoom.id);
      unsubscribeRef.current?.();
      presenceUnsubscribeRef.current?.();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room');
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, reset]);

  const kickPlayer = useCallback(
    async (playerId: string) => {
      if (!isHost) {
        setError('Only the host can kick players');
        return;
      }

      try {
        await roomService.kickPlayer(playerId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to kick player');
      }
    },
    [isHost]
  );

  const transferHost = useCallback(
    async (playerId: string) => {
      if (!isHost) {
        setError('Only the host can transfer host');
        return;
      }

      try {
        await roomService.transferHost(playerId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to transfer host');
      }
    },
    [isHost]
  );

  const updateSettings = useCallback(
    async (settings: Partial<RoomSettings>) => {
      if (!currentRoom || !isHost) return;

      try {
        await roomService.updateSettings(currentRoom.id, settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update settings');
      }
    },
    [currentRoom, isHost]
  );

  const startGame = useCallback(
    async (gameType: GameType, initialState: Record<string, unknown> = {}) => {
      if (!currentRoom || !isHost) return;

      try {
        await roomService.startGame(currentRoom.id, gameType, initialState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start game');
      }
    },
    [currentRoom, isHost]
  );

  const endGame = useCallback(async () => {
    if (!currentRoom || !isHost) return;

    try {
      await roomService.endGame(currentRoom.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game');
    }
  }, [currentRoom, isHost]);

  const updateGameState = useCallback(
    async (gameState: Record<string, unknown>) => {
      if (!currentRoom) return;

      try {
        await roomService.updateGameState(currentRoom.id, gameState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update game state');
      }
    },
    [currentRoom]
  );

  return {
    room: currentRoom,
    players,
    currentPlayer,
    isHost,
    isConnected,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    transferHost,
    updateSettings,
    startGame,
    endGame,
    updateGameState,
    isConfigured,
  };
}
