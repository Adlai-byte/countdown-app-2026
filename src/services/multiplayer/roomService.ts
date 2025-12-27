import { supabase, setPlayerId, clearPlayerId, getPlayerId } from './supabaseClient';
import type { Room, Player, RoomSettings, GameType, RoomRow, PlayerRow } from './types';

// Generate a 6-character room code
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous: 0,O,1,I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Convert database row to Room type
const toRoom = (row: RoomRow): Room => ({
  id: row.id,
  code: row.code,
  host_id: row.host_id,
  game_type: row.game_type as GameType | null,
  game_state: row.game_state,
  status: row.status as Room['status'],
  settings: row.settings as RoomSettings,
  created_at: row.created_at,
  expires_at: row.expires_at,
});

// Convert database row to Player type
const toPlayer = (row: PlayerRow): Player => ({
  id: row.id,
  room_id: row.room_id,
  name: row.name,
  avatar_color: row.avatar_color,
  avatar_emoji: row.avatar_emoji,
  is_host: row.is_host,
  is_connected: row.is_connected,
  last_seen: row.last_seen,
  player_state: row.player_state,
});

export interface CreateRoomOptions {
  playerName: string;
  avatarColor?: string;
  avatarEmoji?: string;
  settings?: Partial<RoomSettings>;
}

export interface JoinRoomOptions {
  code: string;
  playerName: string;
  avatarColor?: string;
  avatarEmoji?: string;
}

export interface RoomWithPlayers {
  room: Room;
  players: Player[];
  currentPlayer: Player;
}

export const roomService = {
  /**
   * Create a new room and become the host
   */
  async createRoom(options: CreateRoomOptions): Promise<RoomWithPlayers> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { playerName, avatarColor = '#9333ea', avatarEmoji = '😀', settings = {} } = options;

    // Generate unique room code (retry if collision)
    let code: string;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      code = generateRoomCode();
      const { data: existing } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique room code');
    }

    // Create room
    const roomSettings: RoomSettings = {
      maxPlayers: 12,
      intensity: 'medium',
      ...settings,
    };

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        host_id: '00000000-0000-0000-0000-000000000000', // Placeholder, updated after player creation
        status: 'lobby',
        settings: roomSettings,
        game_state: {},
      })
      .select()
      .single();

    if (roomError || !roomData) {
      throw new Error(`Failed to create room: ${roomError?.message}`);
    }

    // Create host player
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.id,
        name: playerName,
        avatar_color: avatarColor,
        avatar_emoji: avatarEmoji,
        is_host: true,
        is_connected: true,
      })
      .select()
      .single();

    if (playerError || !playerData) {
      // Cleanup room on failure
      await supabase.from('rooms').delete().eq('id', roomData.id);
      throw new Error(`Failed to create player: ${playerError?.message}`);
    }

    // Update room with correct host_id
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ host_id: playerData.id })
      .eq('id', roomData.id);

    if (updateError) {
      console.error('Failed to update host_id:', updateError);
    }

    // Store player ID locally
    setPlayerId(playerData.id);

    const room = toRoom({ ...roomData, host_id: playerData.id });
    const player = toPlayer(playerData);

    return {
      room,
      players: [player],
      currentPlayer: player,
    };
  },

  /**
   * Join an existing room by code
   */
  async joinRoom(options: JoinRoomOptions): Promise<RoomWithPlayers> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { code, playerName, avatarColor = '#9333ea', avatarEmoji = '😀' } = options;

    // Find room by code
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found. Please check the code and try again.');
    }

    if (roomData.status === 'finished') {
      throw new Error('This room has ended.');
    }

    // Check player limit
    const { data: existingPlayers, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id);

    if (playersError) {
      throw new Error('Failed to check room capacity');
    }

    const settings = roomData.settings as RoomSettings;
    if (existingPlayers && existingPlayers.length >= (settings.maxPlayers || 12)) {
      throw new Error('Room is full');
    }

    // Check for duplicate name
    const nameExists = existingPlayers?.some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameExists) {
      throw new Error('Name already taken in this room');
    }

    // Create player
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.id,
        name: playerName,
        avatar_color: avatarColor,
        avatar_emoji: avatarEmoji,
        is_host: false,
        is_connected: true,
      })
      .select()
      .single();

    if (playerError || !playerData) {
      throw new Error(`Failed to join room: ${playerError?.message}`);
    }

    // Store player ID locally
    setPlayerId(playerData.id);

    const room = toRoom(roomData);
    const players = [...(existingPlayers || []).map(toPlayer), toPlayer(playerData)];

    return {
      room,
      players,
      currentPlayer: toPlayer(playerData),
    };
  },

  /**
   * Leave current room
   */
  async leaveRoom(roomId: string): Promise<void> {
    if (!supabase) return;

    const playerId = getPlayerId();
    if (!playerId) return;

    // Get player info to check if host
    const { data: player } = await supabase
      .from('players')
      .select('is_host')
      .eq('id', playerId)
      .single();

    // Delete player
    await supabase.from('players').delete().eq('id', playerId);

    // If host, transfer to another player or delete room
    if (player?.is_host) {
      const { data: remainingPlayers } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', roomId)
        .eq('is_connected', true)
        .order('last_seen', { ascending: true })
        .limit(1);

      if (remainingPlayers && remainingPlayers.length > 0) {
        // Transfer host
        await supabase
          .from('players')
          .update({ is_host: true })
          .eq('id', remainingPlayers[0].id);

        await supabase
          .from('rooms')
          .update({ host_id: remainingPlayers[0].id })
          .eq('id', roomId);
      } else {
        // No players left, delete room
        await supabase.from('rooms').delete().eq('id', roomId);
      }
    }

    clearPlayerId();
  },

  /**
   * Kick a player from the room (host only)
   */
  async kickPlayer(playerId: string): Promise<void> {
    if (!supabase) return;

    const currentPlayerId = getPlayerId();
    if (!currentPlayerId) throw new Error('Not in a room');

    // Verify current player is host
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('is_host, room_id')
      .eq('id', currentPlayerId)
      .single();

    if (!currentPlayer?.is_host) {
      throw new Error('Only the host can kick players');
    }

    // Can't kick yourself
    if (playerId === currentPlayerId) {
      throw new Error("Can't kick yourself");
    }

    await supabase.from('players').delete().eq('id', playerId);
  },

  /**
   * Transfer host to another player
   */
  async transferHost(newHostId: string): Promise<void> {
    if (!supabase) return;

    const currentPlayerId = getPlayerId();
    if (!currentPlayerId) throw new Error('Not in a room');

    // Get current player's room
    const { data: currentPlayer } = await supabase
      .from('players')
      .select('is_host, room_id')
      .eq('id', currentPlayerId)
      .single();

    if (!currentPlayer?.is_host) {
      throw new Error('Only the host can transfer host');
    }

    // Update both players
    await supabase
      .from('players')
      .update({ is_host: false })
      .eq('id', currentPlayerId);

    await supabase
      .from('players')
      .update({ is_host: true })
      .eq('id', newHostId);

    await supabase
      .from('rooms')
      .update({ host_id: newHostId })
      .eq('id', currentPlayer.room_id);
  },

  /**
   * Update room settings (host only)
   */
  async updateSettings(roomId: string, settings: Partial<RoomSettings>): Promise<void> {
    if (!supabase) return;

    const { data: room } = await supabase
      .from('rooms')
      .select('settings')
      .eq('id', roomId)
      .single();

    if (!room) throw new Error('Room not found');

    const newSettings = { ...room.settings, ...settings };

    await supabase
      .from('rooms')
      .update({ settings: newSettings })
      .eq('id', roomId);
  },

  /**
   * Start a game (host only)
   */
  async startGame(roomId: string, gameType: GameType, initialState: Record<string, unknown> = {}): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('rooms')
      .update({
        status: 'playing',
        game_type: gameType,
        game_state: initialState,
      })
      .eq('id', roomId);
  },

  /**
   * End game and return to lobby
   */
  async endGame(roomId: string): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('rooms')
      .update({
        status: 'lobby',
        game_type: null,
        game_state: {},
      })
      .eq('id', roomId);
  },

  /**
   * Update game state
   */
  async updateGameState(roomId: string, gameState: Record<string, unknown>): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('rooms')
      .update({ game_state: gameState })
      .eq('id', roomId);
  },

  /**
   * Update player connection status
   */
  async updateConnectionStatus(playerId: string, isConnected: boolean): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('players')
      .update({
        is_connected: isConnected,
        last_seen: new Date().toISOString(),
      })
      .eq('id', playerId);
  },

  /**
   * Get room by code
   */
  async getRoomByCode(code: string): Promise<Room | null> {
    if (!supabase) return null;

    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    return data ? toRoom(data) : null;
  },

  /**
   * Get room with players
   */
  async getRoomWithPlayers(roomId: string): Promise<RoomWithPlayers | null> {
    if (!supabase) return null;

    const playerId = getPlayerId();

    const [{ data: roomData }, { data: playersData }] = await Promise.all([
      supabase.from('rooms').select('*').eq('id', roomId).single(),
      supabase.from('players').select('*').eq('room_id', roomId),
    ]);

    if (!roomData) return null;

    const room = toRoom(roomData);
    const players = (playersData || []).map(toPlayer);
    const currentPlayer = players.find((p) => p.id === playerId);

    if (!currentPlayer) return null;

    return { room, players, currentPlayer };
  },
};
