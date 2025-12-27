import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Multiplayer features will be disabled. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export const isSupabaseConfigured = () => Boolean(supabase);

// Helper to get or create a unique visitor ID for presence tracking
export const getVisitorId = (): string => {
  const VISITOR_ID_KEY = 'nye_visitor_id';
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
};

// Helper to get stored player ID for room sessions
export const getPlayerId = (): string | null => {
  return localStorage.getItem('nye_player_id');
};

export const setPlayerId = (playerId: string): void => {
  localStorage.setItem('nye_player_id', playerId);
};

export const clearPlayerId = (): void => {
  localStorage.removeItem('nye_player_id');
};
