// Multiplayer services barrel export
export { supabase, isSupabaseConfigured, getVisitorId, getPlayerId, setPlayerId, clearPlayerId } from './supabaseClient';
export { roomService } from './roomService';
export type { CreateRoomOptions, JoinRoomOptions, RoomWithPlayers } from './roomService';
export { subscribeToRoom, broadcastEvent, subscribeToVisitorCount, getVisitorCount, trackPlayerPresence } from './realtimeService';
export * from './types';
