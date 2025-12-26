import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Download, Share2, ExternalLink } from 'lucide-react';
import type { Meme } from '@/hooks/useMemes';
import { useMemeStore } from '@/stores/memeStore';

interface MemeModalProps {
  meme: Meme | null;
  onClose: () => void;
}

export function MemeModal({ meme, onClose }: MemeModalProps) {
  const { isFavorite, toggleFavorite } = useMemeStore();
  const favorite = meme ? isFavorite(meme.id) : false;

  const handleDownload = async () => {
    if (!meme) return;

    try {
      const response = await fetch(meme.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${meme.name.replace(/\s+/g, '-')}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab
      window.open(meme.url, '_blank');
    }
  };

  const handleShare = async () => {
    if (!meme) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.name,
          text: `Check out this meme: ${meme.name}`,
          url: meme.url,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(meme.url);
    }
  };

  return (
    <AnimatePresence>
      {meme && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-surface rounded-2xl overflow-hidden max-w-lg w-full max-h-full flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-medium text-text-primary truncate flex-1 mr-2">
                  {meme.name}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                >
                  <X size={20} className="text-text-muted" />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 overflow-auto p-4">
                <img
                  src={meme.url}
                  alt={meme.name}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-around p-4 border-t border-border">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(meme.id)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-xl transition-colors
                    ${favorite ? 'text-magenta' : 'text-text-muted hover:text-text-secondary'}
                  `}
                >
                  <Heart size={24} fill={favorite ? 'currentColor' : 'none'} />
                  <span className="text-xs">Favorite</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
                >
                  <Download size={24} />
                  <span className="text-xs">Download</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
                >
                  <Share2 size={24} />
                  <span className="text-xs">Share</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.open(meme.url, '_blank')}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-text-muted hover:text-text-secondary transition-colors"
                >
                  <ExternalLink size={24} />
                  <span className="text-xs">Open</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
