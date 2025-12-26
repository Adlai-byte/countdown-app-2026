import { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { getStickerById } from '@/data/stickers';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';

interface StickerOverlayProps {
  stickerId: string;
  containerWidth: number;
  containerHeight: number;
  constraintsRef?: React.RefObject<HTMLDivElement | null>;
}

export function StickerOverlay({
  stickerId,
  containerWidth,
  containerHeight,
  constraintsRef
}: StickerOverlayProps) {
  const sticker = getStickerById(stickerId);
  const { stickerPosition, setStickerPosition } = usePhotoBoothStore();
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  if (!sticker || sticker.id === 'none') return null;

  // Calculate default position based on sticker settings
  const getDefaultPosition = () => {
    const padding = 16;
    const stickerSize = sticker.size === 'small' ? 48 : sticker.size === 'large' ? 80 : 64;

    switch (sticker.position) {
      case 'top-left':
        return { x: padding, y: padding };
      case 'top-right':
        return { x: containerWidth - stickerSize - padding, y: padding };
      case 'top-center':
        return { x: (containerWidth - stickerSize) / 2, y: padding };
      case 'bottom-left':
        return { x: padding, y: containerHeight - stickerSize - padding - 60 };
      case 'bottom-right':
        return { x: containerWidth - stickerSize - padding, y: containerHeight - stickerSize - padding - 60 };
      case 'bottom-center':
        return { x: (containerWidth - stickerSize) / 2, y: containerHeight - stickerSize - padding - 60 };
      default:
        return { x: padding, y: padding };
    }
  };

  const getSize = () => {
    switch (sticker.size) {
      case 'small': return 'text-3xl';
      case 'medium': return 'text-5xl';
      case 'large': return 'text-6xl';
      default: return 'text-5xl';
    }
  };

  // Use stored position or calculate default
  const position = stickerPosition || getDefaultPosition();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        // Calculate new position relative to container
        const newX = position.x + info.offset.x;
        const newY = position.y + info.offset.y;
        setStickerPosition({ x: newX, y: newY });
      }}
      initial={{
        x: position.x,
        y: position.y,
        scale: 0,
        opacity: 0
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: 1,
        opacity: 1
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileDrag={{ scale: 1.1 }}
      className={`absolute top-0 left-0 ${getSize()} cursor-grab active:cursor-grabbing z-10`}
      style={{ touchAction: 'none' }}
    >
      <motion.span
        animate={!isDragging ? {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        } : undefined}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="inline-block drop-shadow-lg select-none"
        style={{
          textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {sticker.emoji}
      </motion.span>

      {/* Drag hint - shows briefly */}
      {!stickerPosition && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-full"
        >
          Drag to move
        </motion.div>
      )}
    </motion.div>
  );
}
