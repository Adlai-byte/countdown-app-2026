import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useMemes, type Meme } from '@/hooks/useMemes';
import { useMemeStore } from '@/stores/memeStore';
import { MemeGrid } from '@/components/memes/MemeGrid';
import { MemeModal } from '@/components/memes/MemeModal';
import { MemeFilters } from '@/components/memes/MemeFilters';

export function MemesPage() {
  const { memes, isLoading, error, refetch } = useMemes();
  const { sortBy, searchQuery, favorites } = useMemeStore();
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Filter and sort memes
  const filteredMemes = useMemo(() => {
    let result = [...memes];

    // Filter by favorites if showing favorites
    if (showFavorites) {
      result = result.filter((meme) => favorites.includes(meme.id));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((meme) =>
        meme.name.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'random') {
      result = [...result].sort(() => Math.random() - 0.5);
    }
    // 'popular' keeps the default API order

    return result;
  }, [memes, sortBy, searchQuery, showFavorites, favorites]);

  return (
    <div className="flex-1 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1
              className="text-2xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Meme Gallery
            </h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={refetch}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-surface-elevated transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={20}
                className={`text-text-muted ${isLoading ? 'animate-spin' : ''}`}
              />
            </motion.button>
          </div>
          <p className="text-text-secondary">
            Browse and share the internet's finest memes
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <MemeFilters
            showFavorites={showFavorites}
            onToggleFavorites={() => setShowFavorites(!showFavorites)}
            favoritesCount={favorites.length}
          />
        </motion.div>

        {/* Content */}
        {isLoading && memes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-purple animate-spin mb-4" />
            <p className="text-text-muted">Loading memes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-magenta mb-4">{error}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="px-6 py-2 rounded-full bg-purple text-white font-medium"
            >
              Try Again
            </motion.button>
          </div>
        ) : showFavorites && favorites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted mb-2">No favorites yet</p>
            <p className="text-text-muted text-sm">
              Tap the heart icon on memes to add them to your favorites
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MemeGrid
              memes={filteredMemes}
              onSelectMeme={setSelectedMeme}
            />
          </motion.div>
        )}

        {/* Meme count */}
        {!isLoading && !error && filteredMemes.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-text-muted mt-6"
          >
            Showing {filteredMemes.length} memes
          </motion.p>
        )}
      </div>

      {/* Modal */}
      <MemeModal
        meme={selectedMeme}
        onClose={() => setSelectedMeme(null)}
      />
    </div>
  );
}
