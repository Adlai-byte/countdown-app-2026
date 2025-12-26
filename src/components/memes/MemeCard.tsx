import { motion } from 'framer-motion';
import { Heart, Share2 } from 'lucide-react';
import type { Meme } from '@/hooks/useMemes';
import { useMemeStore } from '@/stores/memeStore';

interface MemeCardProps {
  meme: Meme;
  onClick: () => void;
}

export function MemeCard({ meme, onClick }: MemeCardProps) {
  const { isFavorite, toggleFavorite } = useMemeStore();
  const favorite = isFavorite(meme.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(meme.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.name,
          url: meme.url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(meme.url);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-xl overflow-hidden bg-surface-elevated"
    >
      {/* Image */}
      <div className="aspect-square relative">
        <img
          src={meme.url}
          alt={meme.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
          <p className="text-white text-sm font-medium text-center line-clamp-2">
            {meme.name}
          </p>

          {/* Quick actions */}
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className={`
                p-2 rounded-full transition-colors
                ${favorite ? 'bg-magenta text-white' : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Share2 size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Favorite indicator */}
      {favorite && (
        <div className="absolute top-2 right-2">
          <Heart size={18} className="text-magenta fill-magenta" />
        </div>
      )}
    </motion.div>
  );
}
