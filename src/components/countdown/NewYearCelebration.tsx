import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';
import { useConfetti } from '@/hooks/useConfetti';
import { useSettingsStore } from '@/stores/settingsStore';
import { Sparkles, PartyPopper, Volume2, VolumeX } from 'lucide-react';

interface NewYearCelebrationProps {
  year: number;
}

// Celebration sound URLs (royalty-free)
const SOUNDS = {
  champagne: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  cheering: 'https://assets.mixkit.co/active_storage/sfx/2191/2191-preview.mp3',
  firework: 'https://assets.mixkit.co/active_storage/sfx/1685/1685-preview.mp3',
};

export function NewYearCelebration({ year }: NewYearCelebrationProps) {
  const { fireCelebration, fireStars, fireFireworks, fireGoldRain } = useConfetti();
  const { soundEnabled } = useSettingsStore();
  const [hasPlayed, setHasPlayed] = useState(false);

  // Sound hooks
  const [playChampagne] = useSound(SOUNDS.champagne, {
    volume: 0.6,
    soundEnabled
  });
  const [playCheering] = useSound(SOUNDS.cheering, {
    volume: 0.4,
    soundEnabled
  });
  const [playFirework] = useSound(SOUNDS.firework, {
    volume: 0.5,
    soundEnabled
  });

  useEffect(() => {
    if (hasPlayed) return;
    setHasPlayed(true);

    // Fire initial celebration with sounds
    fireCelebration();
    fireFireworks();

    if (soundEnabled) {
      playChampagne();
      setTimeout(() => playCheering(), 500);
      setTimeout(() => playFirework(), 1000);
      setTimeout(() => playFirework(), 2000);
    }

    // Gold rain after initial burst
    setTimeout(() => {
      fireGoldRain();
    }, 2000);

    // Continue with periodic bursts
    const interval = setInterval(() => {
      fireStars();
      if (soundEnabled) {
        playFirework();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fireCelebration, fireStars, fireFireworks, fireGoldRain, playChampagne, playCheering, playFirework, soundEnabled, hasPlayed]);

  return (
    <div className="flex flex-col items-center justify-center px-4 text-center">
      {/* Animated Icons */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex items-center gap-4 mb-6"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <PartyPopper size={48} className="text-gold" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Sparkles size={48} className="text-magenta" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <PartyPopper size={48} className="text-cyan" />
        </motion.div>
      </motion.div>

      {/* Happy New Year Text */}
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <motion.span
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-gradient-to-r from-gold via-magenta to-purple bg-[length:200%_auto] bg-clip-text text-transparent"
        >
          Happy New Year!
        </motion.span>
      </motion.h1>

      {/* Year */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <span
          className="text-8xl sm:text-9xl font-bold gradient-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {year}
        </span>
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 blur-3xl bg-gradient-to-r from-gold via-magenta to-purple opacity-30 -z-10"
        />
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xl text-text-secondary max-w-md"
      >
        Wishing you a year filled with success, happiness, and new accomplishments!
      </motion.p>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            fireCelebration();
            fireFireworks();
            if (soundEnabled) {
              playChampagne();
              setTimeout(() => playCheering(), 300);
            }
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold via-magenta to-purple text-white font-medium shadow-lg shadow-purple-500/25"
        >
          Celebrate Again!
        </motion.button>

        {/* Sound Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => useSettingsStore.getState().toggleSound()}
          className="p-3 rounded-full bg-surface-elevated hover:bg-border/30 transition-colors"
          title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
        >
          {soundEnabled ? (
            <Volume2 size={24} className="text-gold" />
          ) : (
            <VolumeX size={24} className="text-text-muted" />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
