import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Flame, Bomb } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const TICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
const EXPLOSION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1684/1684-preview.mp3';

export function HotPotato() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showTime, setShowTime] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explosionTimeRef = useRef<number>(0);
  const { fireCelebration } = useConfetti();

  const [playTick] = useSound(TICK_SOUND, { volume: 0.3 });
  const [playExplosion] = useSound(EXPLOSION_SOUND, { volume: 0.5 });

  // Generate random time between 10-30 seconds
  const generateRandomTime = useCallback(() => {
    return Math.floor(Math.random() * 21) + 10; // 10-30 seconds
  }, []);

  const startGame = useCallback(() => {
    const explosionTime = generateRandomTime();
    explosionTimeRef.current = explosionTime;
    setTimeLeft(explosionTime);
    setIsRunning(true);
    setHasExploded(false);
    setShowTime(true);
  }, [generateRandomTime]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);
    setHasExploded(false);
    setTimeLeft(null);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsRunning(false);
      setHasExploded(true);
      playExplosion();
      fireCelebration();
      return;
    }

    // Play tick sound for last 5 seconds
    if (timeLeft <= 5) {
      playTick();
    }

    // Hide time display when less than 5 seconds
    if (timeLeft <= 5) {
      setShowTime(false);
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, playTick, playExplosion, fireCelebration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Game Area */}
      <Card variant="glass" className="text-center py-8">
        <AnimatePresence mode="wait">
          {!isRunning && !hasExploded ? (
            // Start State
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame size={48} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Hot Potato</h3>
                <p className="text-text-secondary text-sm">
                  Pass the phone around! When it explodes, you're out!
                </p>
              </div>
              <Button variant="primary" onClick={startGame} className="px-8">
                <Play size={20} className="mr-2" />
                Start Game
              </Button>
            </motion.div>
          ) : isRunning ? (
            // Running State
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              {/* Animated Bomb */}
              <motion.div
                animate={{
                  scale: timeLeft !== null && timeLeft <= 5 ? [1, 1.1, 1] : 1,
                  rotate: timeLeft !== null && timeLeft <= 3 ? [-5, 5, -5] : 0,
                }}
                transition={{
                  duration: 0.3,
                  repeat: timeLeft !== null && timeLeft <= 5 ? Infinity : 0,
                }}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/50 relative"
              >
                <Bomb size={64} className="text-white" />

                {/* Fuse Animation */}
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  <div className="w-3 h-6 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full" />
                </motion.div>

                {/* Glow Effect */}
                {timeLeft !== null && timeLeft <= 5 && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-red-500 mb-2">
                  PASS IT QUICK!
                </h3>
                {showTime && timeLeft !== null ? (
                  <p className="text-4xl font-bold text-text-primary">
                    {timeLeft}s
                  </p>
                ) : (
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="text-2xl font-bold text-red-500"
                  >
                    ???
                  </motion.p>
                )}
              </div>
            </motion.div>
          ) : (
            // Exploded State
            <motion.div
              key="exploded"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg relative overflow-hidden"
              >
                {/* Explosion particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * Math.PI) / 4) * 80,
                      y: Math.sin((i * Math.PI) / 4) * 80,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="absolute w-4 h-4 rounded-full bg-orange-500"
                  />
                ))}
                <span className="text-5xl">💥</span>
              </motion.div>

              <div>
                <h3 className="text-3xl font-bold text-red-500 mb-2">
                  BOOM!
                </h3>
                <p className="text-text-secondary">
                  You got caught with the potato!
                </p>
              </div>

              <Button variant="secondary" onClick={resetGame} className="px-8">
                <RotateCcw size={20} className="mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
          <li>Press Start and pass the phone around</li>
          <li>The timer is random (10-30 seconds)</li>
          <li>Last 5 seconds are hidden!</li>
          <li>Whoever holds it when it explodes loses!</li>
        </ol>
      </Card>
    </div>
  );
}
