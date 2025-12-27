import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, getVisitorId } from './supabaseClient';
import type { Room, Player, RealtimeEventType } from './types';

type SubscriptionCallback<T> = (payload: T) => void;

interface RoomSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

interface PresenceState {
  visitorId: string;
  joinedAt: string;
}

/**
 * Subscribe to room changes (room data, players, game state)
 */
export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onRoomUpdate?: SubscriptionCallback<Room>;
    onPlayersChange?: SubscriptionCallback<Player[]>;
    onPlayerJoined?: SubscriptionCallback<Player>;
    onPlayerLeft?: SubscriptionCallback<{ playerId: string }>;
    onGameStateUpdate?: SubscriptionCallback<Record<string, unknown>>;
    onError?: SubscriptionCallback<Error>;
  }
): RoomSubscription {
  if (!supabase) {
    return {
      channel: null as unknown as RealtimeChannel,
      unsubscribe: () => {},
    };
  }

  const channel = supabase.channel(`room:${roomId}`);

  // Subscribe to room table changes
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`,
    },
    (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const room = payload.new as Room;
        callbacks.onRoomUpdate?.(room);
        callbacks.onGameStateUpdate?.(room.game_state);
      }
    }
  );

  // Subscribe to players table changes
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `room_id=eq.${roomId}`,
    },
    async (payload) => {
      if (payload.eventType === 'INSERT') {
        callbacks.onPlayerJoined?.(payload.new as Player);
      } else if (payload.eventType === 'DELETE') {
        callbacks.onPlayerLeft?.({ playerId: (payload.old as { id: string }).id });
      }

      // Fetch all players on any change
      const { data: players } = await supabase!
        .from('players')
        .select('*')
        .eq('room_id', roomId);

      if (players) {
        callbacks.onPlayersChange?.(players as Player[]);
      }
    }
  );

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`Subscribed to room: ${roomId}`);
    } else if (status === 'CHANNEL_ERROR') {
      callbacks.onError?.(new Error('Failed to subscribe to room'));
    }
  });

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Broadcast a custom event to all players in the room
 */
export function broadcastEvent(
  roomId: string,
  eventType: RealtimeEventType | string,
  payload: Record<string, unknown>
): void {
  if (!supabase) return;

  const channel = supabase.channel(`room:${roomId}`);
  channel.send({
    type: 'broadcast',
    event: eventType,
    payload: {
      ...payload,
      timestamp: Date.now(),
    },
  });
}

// --- Live Visitor Count Feature ---

interface VisitorCountCallbacks {
  onCountChange: (count: number) => void;
  onError?: (error: Error) => void;
}

let visitorChannel: RealtimeChannel | null = null;
let visitorCountCallbacks: VisitorCountCallbacks | null = null;

/**
 * Subscribe to live visitor count across the entire app
 */
export function subscribeToVisitorCount(callbacks: VisitorCountCallbacks): () => void {
  if (!supabase) {
    // Return dummy count for non-configured mode
    callbacks.onCountChange(1);
    return () => {};
  }

  visitorCountCallbacks = callbacks;
  const visitorId = getVisitorId();

  visitorChannel = supabase!.channel('visitors', {
    config: {
      presence: {
        key: visitorId,
      },
    },
  });

  visitorChannel
    .on('presence', { event: 'sync' }, () => {
      if (!visitorChannel) return;
      const state = visitorChannel.presenceState<PresenceState>();
      const count = Object.keys(state).length;
      visitorCountCallbacks?.onCountChange(count);
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      console.log('Visitor joined:', newPresences.length);
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      console.log('Visitor left:', leftPresences.length);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track this visitor
        await visitorChannel?.track({
          visitorId,
          joinedAt: new Date().toISOString(),
        });
      } else if (status === 'CHANNEL_ERROR') {
        callbacks.onError?.(new Error('Failed to subscribe to visitor count'));
      }
    });

  return () => {
    visitorChannel?.unsubscribe();
    visitorChannel = null;
    visitorCountCallbacks = null;
  };
}

/**
 * Get current visitor count (one-time fetch)
 */
export async function getVisitorCount(): Promise<number> {
  if (!visitorChannel) return 1;
  const state = visitorChannel.presenceState<PresenceState>();
  return Object.keys(state).length;
}

// --- Room Presence (for player online status) ---

interface RoomPresenceState {
  playerId: string;
  playerName: string;
  online_at: string;
}

/**
 * Track player presence in a room (online/offline status)
 */
export function trackPlayerPresence(
  roomId: string,
  playerId: string,
  playerName: string,
  callbacks: {
    onPresenceChange?: (onlinePlayers: string[]) => void;
  }
): () => void {
  if (!supabase) return () => {};

  const channel = supabase.channel(`presence:${roomId}`, {
    config: {
      presence: {
        key: playerId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<RoomPresenceState>();
      const onlinePlayers = Object.keys(state);
      callbacks.onPresenceChange?.(onlinePlayers);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          playerId,
          playerName,
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    channel.unsubscribe();
  };
}
