import { motion } from 'framer-motion';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';
import { photoStickers } from '@/data/stickers';
import { Card } from '@/components/ui';

export function StickerSelector() {
  const { selectedSticker, setSelectedSticker } = usePhotoBoothStore();

  return (
    <Card variant="glass" className="p-3">
      <p className="text-xs text-text-muted mb-2 text-center">Add Sticker</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {photoStickers.map((sticker) => {
          const isSelected = selectedSticker === sticker.id;

          return (
            <motion.button
              key={sticker.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSticker(sticker.id)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl
                transition-all
                ${isSelected
                  ? 'bg-gradient-to-br from-purple to-magenta ring-2 ring-gold'
                  : 'bg-surface-elevated hover:bg-border/30'
                }
              `}
              title={sticker.name}
            >
              {sticker.id === 'none' ? '✕' : sticker.emoji}
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
