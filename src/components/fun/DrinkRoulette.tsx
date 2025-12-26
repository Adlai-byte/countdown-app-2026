import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Wine, Users, Zap, Shield } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomRouletteOption, type RouletteOption } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const SPIN_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
const RESULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

export function DrinkRoulette() {
  const [result, setResult] = useState<RouletteOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireSmall, fireCelebration } = useConfetti();

  const [playSpin] = useSound(SPIN_SOUND, { volume: 0.3 });
  const [playResult] = useSound(RESULT_SOUND, { volume: 0.4 });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drink': return <Wine size={24} className="text-purple" />;
      case 'dare': return <Zap size={24} className="text-yellow-500" />;
      case 'safe': return <Shield size={24} className="text-green-500" />;
      case 'group': return <Users size={24} className="text-pink-500" />;
      default: return <Wine size={24} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'drink': return 'from-purple to-magenta';
      case 'dare': return 'from-yellow-500 to-orange-500';
      case 'safe': return 'from-green-500 to-emerald-500';
      case 'group': return 'from-pink-500 to-rose-500';
      default: return 'from-purple to-magenta';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'drink': return { text: 'DRINK', color: 'bg-purple/20 text-purple' };
      case 'dare': return { text: 'DARE', color: 'bg-yellow-500/20 text-yellow-500' };
      case 'safe': return { text: 'SAFE', color: 'bg-green-500/20 text-green-500' };
      case 'group': return { text: 'GROUP', color: 'bg-pink-500/20 text-pink-500' };
      default: return { text: 'DRINK', color: 'bg-purple/20 text-purple' };
    }
  };

  const spin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    playSpin();

    // Start rotation animation
    let currentRotation = rotation;
    const targetRotation = currentRotation + 1440 + Math.random() * 720; // 4-6 full spins

    const spinDuration = 3000; // 3 seconds
    const startTime = Date.now();

    spinRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const newRotation = currentRotation + (targetRotation - currentRotation) * eased;

      setRotation(newRotation);

      if (progress >= 1) {
        if (spinRef.current) {
          clearInterval(spinRef.current);
        }
        setIsSpinning(false);

        // Get result
        const option = getRandomRouletteOption();
        setResult(option);
        playResult();

        if (option.type === 'safe') {
          fireCelebration();
        } else {
          fireSmall();
        }
      }
    }, 16);
  }, [isSpinning, rotation, playSpin, playResult, fireSmall, fireCelebration]);

  // Cleanup
  const reset = () => {
    setResult(null);
    setRotation(0);
  };

  return (
    <div className="space-y-4">
      {/* Wheel */}
      <Card variant="glass" className="py-8">
        <div className="relative flex flex-col items-center">
          {/* Pointer */}
          <div className="absolute top-0 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold" />
          </div>

          {/* Spinning Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0 }}
            className="w-48 h-48 rounded-full bg-gradient-conic from-purple via-magenta via-gold via-cyan via-green to-purple relative shadow-xl"
            style={{
              background: `conic-gradient(
                #8b5cf6 0deg 45deg,
                #ec4899 45deg 90deg,
                #f59e0b 90deg 135deg,
                #22c55e 135deg 180deg,
                #06b6d4 180deg 225deg,
                #8b5cf6 225deg 270deg,
                #ec4899 270deg 315deg,
                #f59e0b 315deg 360deg
              )`,
            }}
          >
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center shadow-lg">
                {isSpinning ? (
                  <motion.span
                    animate={{ rotate: -rotation }}
                    className="text-2xl"
                  >
                    🎰
                  </motion.span>
                ) : (
                  <span className="text-2xl">🎰</span>
                )}
              </div>
            </div>

            {/* Segments */}
            {['🍷', '🎯', '🛡️', '👥', '🍺', '⚡', '🎉', '🥂'].map((emoji, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45 + 22.5}deg) translateY(-70px)`,
                }}
              >
                <span
                  className="text-xl"
                  style={{ transform: `rotate(-${i * 45 + 22.5}deg)`, display: 'block' }}
                >
                  {emoji}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Spin Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spin}
            disabled={isSpinning}
            className={`
              mt-6 px-8 py-3 rounded-full font-bold text-white
              bg-gradient-to-r from-purple to-magenta
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-purple/30
            `}
          >
            {isSpinning ? 'Spinning...' : 'SPIN!'}
          </motion.button>
        </div>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass" className={`p-6 bg-gradient-to-br ${getTypeColor(result.type)} bg-opacity-20`}>
              <div className="text-center space-y-4">
                {/* Type Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(result.type).color}`}>
                  {getTypeBadge(result.type).text}
                </span>

                {/* Icon */}
                <div className="flex justify-center">
                  {getTypeIcon(result.type)}
                </div>

                {/* Result Text */}
                <p className="text-xl font-bold text-text-primary">
                  {result.text}
                </p>

                {/* Intensity */}
                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i <= result.intensity ? 'bg-gold' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      {result && (
        <Button variant="ghost" onClick={reset} className="w-full">
          <RotateCcw size={18} className="mr-2" />
          Clear Result
        </Button>
      )}

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Take turns spinning the wheel</li>
          <li>Follow the result - drink, dare, or celebrate!</li>
          <li>Group challenges affect everyone</li>
          <li>Safe means you're off the hook!</li>
        </ul>
      </Card>
    </div>
  );
}
