import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const POP_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3';

interface ConfettiCannonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating';
}

export function ConfettiCannon({ size = 'md', variant = 'default' }: ConfettiCannonProps) {
  const [isPopping, setIsPopping] = useState(false);
  const { fireCelebration, fireSmall } = useConfetti();
  const [playPop] = useSound(POP_SOUND, { volume: 0.5 });

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const handleClick = useCallback(() => {
    setIsPopping(true);
    playPop();

    // Fire multiple confetti bursts
    fireCelebration();
    setTimeout(() => fireSmall(), 200);
    setTimeout(() => fireSmall(), 400);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    setTimeout(() => setIsPopping(false), 600);
  }, [fireCelebration, fireSmall, playPop]);

  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`
          fixed bottom-24 left-4 z-40
          ${sizeClasses[size]}
          rounded-full bg-gradient-to-br from-gold via-yellow-500 to-orange-500
          flex items-center justify-center
          shadow-lg shadow-gold/30
          transition-shadow hover:shadow-xl hover:shadow-gold/40
        `}
      >
        <AnimatePresence>
          {isPopping ? (
            <motion.span
              key="popping"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }}
              exit={{ scale: 1 }}
              className="text-white"
            >
              <PartyPopper size={size === 'sm' ? 20 : size === 'md' ? 28 : 36} />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              <PartyPopper size={size === 'sm' ? 20 : size === 'md' ? 28 : 36} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        <AnimatePresence>
          {isPopping && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="absolute inset-0 rounded-full bg-gold"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-2xl bg-gradient-to-br from-gold via-yellow-500 to-orange-500
        flex items-center justify-center
        shadow-lg shadow-gold/30
        transition-shadow hover:shadow-xl hover:shadow-gold/40
        relative overflow-hidden
      `}
    >
      <AnimatePresence>
        {isPopping ? (
          <motion.div
            key="popping"
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }}
            className="text-white"
          >
            <PartyPopper size={size === 'sm' ? 20 : size === 'md' ? 28 : 36} />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-white"
          >
            <PartyPopper size={size === 'sm' ? 20 : size === 'md' ? 28 : 36} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effects */}
      <AnimatePresence>
        {isPopping && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 4) * 40,
                  y: Math.sin((i * Math.PI) / 4) * 40,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                className="absolute w-2 h-2 rounded-full bg-white"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
