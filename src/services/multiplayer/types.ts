// Game types supported by multiplayer
export type GameType =
  | 'would-you-rather'
  | 'truth-or-dare'
  | 'charades'
  | 'bingo'
  | 'never-have-i-ever'
  | 'kings'
  | 'drink-roulette'
  | 'hot-potato';

export type RoomStatus = 'lobby' | 'playing' | 'finished';

export interface RoomSettings {
  maxPlayers?: number;
  intensity?: 'light' | 'medium' | 'spicy';
  category?: string;
  roundTime?: number;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  game_type: GameType | null;
  game_state: Record<string, unknown>;
  status: RoomStatus;
  settings: RoomSettings;
  created_at: string;
  expires_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  avatar_color: string;
  avatar_emoji: string;
  is_host: boolean;
  is_connected: boolean;
  last_seen: string;
  player_state: Record<string, unknown>;
}

export interface GameEvent {
  id: string;
  room_id: string;
  player_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

// Game-specific state interfaces
export interface WouldYouRatherGameState {
  currentQuestionIndex: number;
  currentQuestion: {
    id: string;
    optionA: string;
    optionB: string;
    category: string;
  } | null;
  votes: Record<string, 'a' | 'b'>; // playerId -> vote
  votingOpen: boolean;
  revealResults: boolean;
  questionsPool: string[]; // Question IDs to use
}

export interface TruthOrDareGameState {
  currentPlayerId: string | null;
  challenge: {
    id: string;
    type: 'truth' | 'dare';
    text: string;
    intensity: string;
  } | null;
  intensity: 'light' | 'medium' | 'spicy';
  isSpinning: boolean;
  completedChallenges: string[];
}

export interface CharadesGameState {
  actorId: string | null;
  currentWord: {
    text: string;
    category: string;
  } | null;
  timeLeft: number;
  score: number;
  skipped: number;
  isPlaying: boolean;
  roundStartTime: number | null;
}

export interface BingoGameState {
  calledItems: string[];
  currentCall: string | null;
  isAutoCalling: boolean;
  callerId: string;
  winners: string[];
  callHistory: { item: string; timestamp: number }[];
}

export interface NeverHaveIEverGameState {
  currentStatement: {
    id: string;
    text: string;
    intensity: string;
  } | null;
  responses: Record<string, boolean>; // playerId -> hasNever (true = drink)
  showResponses: boolean;
  intensity: 'all' | 'mild' | 'medium' | 'spicy';
}

export interface KingsGameState {
  currentCard: {
    rank: string;
    suit: string;
    rule: string;
    description: string;
  } | null;
  currentDrawerId: string | null;
  kingsDrawn: number;
  drawnCards: string[];
  turnOrder: string[]; // Player IDs in turn order
  currentTurnIndex: number;
}

export interface DrinkRouletteGameState {
  currentSpinnerId: string | null;
  isSpinning: boolean;
  result: {
    text: string;
    type: 'drink' | 'dare' | 'safe' | 'group';
    intensity: number;
  } | null;
  rotation: number;
  turnOrder: string[];
  currentTurnIndex: number;
}

export interface HotPotatoGameState {
  isRunning: boolean;
  hasExploded: boolean;
  currentHolderId: string | null;
  startTime: number | null;
  duration: number; // Hidden from clients until explosion
  passHistory: { from: string; to: string; timestamp: number }[];
}

// Union type for all game states
export type GameState =
  | WouldYouRatherGameState
  | TruthOrDareGameState
  | CharadesGameState
  | BingoGameState
  | NeverHaveIEverGameState
  | KingsGameState
  | DrinkRouletteGameState
  | HotPotatoGameState;

// Realtime event types
export type RealtimeEventType =
  | 'player_joined'
  | 'player_left'
  | 'player_disconnected'
  | 'player_reconnected'
  | 'host_changed'
  | 'game_started'
  | 'game_ended'
  | 'game_state_updated'
  | 'settings_updated';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

// Database row types (for Supabase responses)
export interface RoomRow {
  id: string;
  code: string;
  host_id: string;
  game_type: string | null;
  game_state: Record<string, unknown>;
  status: string;
  settings: Record<string, unknown>;
  created_at: string;
  expires_at: string;
}

export interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  avatar_color: string;
  avatar_emoji: string;
  is_host: boolean;
  is_connected: boolean;
  last_seen: string;
  player_state: Record<string, unknown>;
}
