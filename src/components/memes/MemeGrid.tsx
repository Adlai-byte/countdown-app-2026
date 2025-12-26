import { motion } from 'framer-motion';
import { MemeCard } from './MemeCard';
import type { Meme } from '@/hooks/useMemes';

interface MemeGridProps {
  memes: Meme[];
  onSelectMeme: (meme: Meme) => void;
}

export function MemeGrid({ memes, onSelectMeme }: MemeGridProps) {
  if (memes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No memes found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
    >
      {memes.map((meme, index) => (
        <motion.div
          key={meme.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <MemeCard meme={meme} onClick={() => onSelectMeme(meme)} />
        </motion.div>
      ))}
    </motion.div>
  );
}
