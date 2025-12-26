import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FlipCardProps {
  value: number;
  label: string;
}

export function FlipCard({ value, label }: FlipCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  const formattedValue = String(displayValue).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Card Container */}
        <div className="flip-card w-20 h-24 sm:w-28 sm:h-32 md:w-32 md:h-36">
          {/* Static Background */}
          <div className="absolute inset-0 rounded-xl bg-surface-elevated border border-border shadow-lg" />

          {/* Number Display */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={displayValue}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span
                className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formattedValue}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Center Line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

          {/* Glow Effect */}
          <motion.div
            animate={{
              opacity: isFlipping ? 0.6 : 0.3,
              scale: isFlipping ? 1.1 : 1,
            }}
            className="absolute inset-0 rounded-xl bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none"
          />
        </div>

        {/* Side Notches */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-4 bg-background rounded-r-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-4 bg-background rounded-l-full" />
      </div>

      {/* Label */}
      <span className="mt-3 text-xs sm:text-sm font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
