import { useEffect } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayerStore';
import { subscribeToVisitorCount, isSupabaseConfigured } from '@/services/multiplayer';

/**
 * Hook to subscribe to live visitor count across the app
 * Returns the current number of visitors viewing the app
 */
export function useVisitorCount(): number {
  const { visitorCount, setVisitorCount } = useMultiplayerStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Set a default count of 1 (just this user) if not configured
      setVisitorCount(1);
      return;
    }

    const unsubscribe = subscribeToVisitorCount({
      onCountChange: (count) => {
        setVisitorCount(count);
      },
      onError: (error) => {
        console.error('Visitor count error:', error);
        setVisitorCount(1);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [setVisitorCount]);

  return visitorCount;
}
