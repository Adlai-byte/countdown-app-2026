import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, RotateCcw, Share2, Users } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';

type ToastState = 'idle' | 'raising' | 'clinking' | 'drinking' | 'done';

const TOAST_MESSAGES = [
  "To new beginnings! 🥂",
  "Here's to 2026! 🎉",
  "Cheers to us! 🌟",
  "To health & happiness! ❤️",
  "May your dreams come true! ✨",
  "To adventure & success! 🚀",
  "Here's to making memories! 📸",
  "To friends & family! 👨‍👩‍👧‍👦",
];

export function ChampagneToast() {
  const [state, setState] = useState<ToastState>('idle');
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState(2);
  const { fireCelebration, fireGoldRain } = useConfetti();

  const startToast = () => {
    const randomMessage = TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)];
    setMessage(randomMessage);
    setState('raising');

    // Sequence: raise -> clink -> drink -> done
    setTimeout(() => setState('clinking'), 1500);
    setTimeout(() => {
      setState('drinking');
      fireGoldRain();
    }, 3000);
    setTimeout(() => {
      setState('done');
      fireCelebration();
    }, 4500);
  };

  const resetToast = () => {
    setState('idle');
    setMessage('');
  };

  const shareToast = async () => {
    const text = `🥂 Virtual Toast: ${message}\n\nJoin me in celebrating the New Year! 🎉`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Virtual Toast', text });
      } catch {
        // Cancelled
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Participants */}
      {state === 'idle' && (
        <Card variant="glass" className="p-4">
          <p className="text-sm text-text-muted mb-3 flex items-center gap-2">
            <Users size={16} />
            How many people are toasting?
          </p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setParticipants(num)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  participants === num
                    ? 'bg-gradient-to-r from-gold to-yellow-500 text-black'
                    : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Toast Animation Area */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 relative overflow-hidden h-[350px]">
        {/* Background bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {state !== 'idle' && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '-100%', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
              className="absolute w-2 h-2 rounded-full bg-gold/30"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-7xl mb-4">🥂</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Virtual Toast</h3>
              <p className="text-text-secondary mb-6 text-center px-4">
                Raise a glass together, even from afar!
              </p>
              <Button variant="primary" onClick={startToast}>
                <Wine size={18} className="mr-2" />
                Start Toast
              </Button>
            </motion.div>
          )}

          {(state === 'raising' || state === 'clinking' || state === 'drinking') && (
            <motion.div
              key="toasting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Glasses */}
              <div className="relative flex items-end justify-center gap-2 mb-8">
                {[...Array(participants)].map((_, i) => {
                  const angle = (i - (participants - 1) / 2) * 15;
                  const isLeft = i < participants / 2;

                  return (
                    <motion.div
                      key={i}
                      initial={{ y: 50, rotate: 0 }}
                      animate={{
                        y: state === 'raising' ? 0 : state === 'drinking' ? -20 : 0,
                        rotate: state === 'clinking'
                          ? angle
                          : state === 'drinking'
                          ? isLeft ? -30 : 30
                          : 0,
                        x: state === 'clinking' ? (isLeft ? 10 : -10) : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-6xl"
                      style={{ originY: 1 }}
                    >
                      🥂
                    </motion.div>
                  );
                })}

                {/* Clink sparkle */}
                {state === 'clinking' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl"
                  >
                    ✨
                  </motion.div>
                )}
              </div>

              {/* State text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-gold text-center"
              >
                {state === 'raising' && 'Raise your glasses...'}
                {state === 'clinking' && 'Cheers! 🥂'}
                {state === 'drinking' && 'Drink up! 🍾'}
              </motion.p>
            </motion.div>
          )}

          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-gold mb-2">Cheers!</h3>
              <p className="text-lg text-text-primary text-center px-4 mb-6">
                {message}
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={shareToast}>
                  <Share2 size={18} className="mr-2" />
                  Share
                </Button>
                <Button variant="primary" onClick={resetToast}>
                  <RotateCcw size={18} className="mr-2" />
                  Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <Card variant="glass" className="p-4 text-center">
        <p className="text-sm text-text-muted">
          💡 Share your screen for a synchronized group toast!
        </p>
      </Card>
    </div>
  );
}
