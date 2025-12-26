import { motion } from 'framer-motion';
import { Search, TrendingUp, Shuffle, Heart } from 'lucide-react';
import { useMemeStore } from '@/stores/memeStore';

interface MemeFiltersProps {
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

export function MemeFilters({ showFavorites, onToggleFavorites, favoritesCount }: MemeFiltersProps) {
  const { sortBy, setSortBy, searchQuery, setSearchQuery } = useMemeStore();

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search memes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-elevated rounded-xl text-text-primary placeholder-text-muted border border-transparent focus:border-purple focus:outline-none transition-colors"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy('popular')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${sortBy === 'popular' && !showFavorites
              ? 'bg-purple text-white'
              : 'bg-surface-elevated text-text-secondary hover:bg-border/30'
            }
          `}
        >
          <TrendingUp size={16} />
          Popular
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortBy('random')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${sortBy === 'random' && !showFavorites
              ? 'bg-purple text-white'
              : 'bg-surface-elevated text-text-secondary hover:bg-border/30'
            }
          `}
        >
          <Shuffle size={16} />
          Random
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFavorites}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${showFavorites
              ? 'bg-magenta text-white'
              : 'bg-surface-elevated text-text-secondary hover:bg-border/30'
            }
          `}
        >
          <Heart size={16} fill={showFavorites ? 'currentColor' : 'none'} />
          {favoritesCount > 0 && <span>({favoritesCount})</span>}
        </motion.button>
      </div>
    </div>
  );
}
