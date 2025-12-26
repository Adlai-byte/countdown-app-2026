import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X, Sparkles } from 'lucide-react';
import { WHEEL_SEGMENTS } from '@/data/predictions';
import { useConfetti } from '@/hooks/useConfetti';

export function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const { fireConfetti } = useConfetti();

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Calculate random result
    const spins = 5 + Math.random() * 5; // 5-10 full spins
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (spins * 360) + randomAngle;

    setRotation(totalRotation);

    // Calculate which segment we landed on
    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360) + 90) % 360; // Adjust for pointer position
      const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
      const selectedSegment = WHEEL_SEGMENTS[segmentIndex % WHEEL_SEGMENTS.length];

      setResult(selectedSegment);
      setIsSpinning(false);
      fireConfetti();
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Wheel Container */}
      <div className="relative flex justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold" />
        </div>

        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: [0.2, 0.8, 0.3, 1] }}
          className="relative w-72 h-72"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {WHEEL_SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              const x1 = 100 + 95 * Math.cos(startRad);
              const y1 = 100 + 95 * Math.sin(startRad);
              const x2 = 100 + 95 * Math.cos(endRad);
              const y2 = 100 + 95 * Math.sin(endRad);

              const largeArc = segmentAngle > 180 ? 1 : 0;

              const path = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;

              // Text position (middle of segment)
              const textAngle = startAngle + segmentAngle / 2 - 90;
              const textRad = textAngle * (Math.PI / 180);
              const textX = 100 + 60 * Math.cos(textRad);
              const textY = 100 + 60 * Math.sin(textRad);

              return (
                <g key={segment.label}>
                  <path d={path} fill={segment.color} stroke="#1a1a2e" strokeWidth="2" />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    transform={`rotate(${startAngle + segmentAngle / 2}, ${textX}, ${textY})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx="100" cy="100" r="15" fill="#1a1a2e" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="8" fill="#ffd700" />
          </svg>
        </motion.div>
      </div>

      {/* Spin Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          disabled={isSpinning}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg
            ${isSpinning
              ? 'bg-surface-elevated text-text-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-purple to-magenta text-white shadow-lg shadow-purple/30'
            }
          `}
        >
          <RotateCw size={24} className={isSpinning ? 'animate-spin' : ''} />
          {isSpinning ? 'Spinning...' : 'Spin for 2026!'}
        </motion.button>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setResult(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            >
              <div
                className="bg-surface rounded-2xl p-6 text-center"
                style={{ borderTop: `4px solid ${result.color}` }}
              >
                <button
                  onClick={() => setResult(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-elevated"
                >
                  <X size={20} className="text-text-muted" />
                </button>

                <Sparkles size={48} className="mx-auto mb-4" style={{ color: result.color }} />

                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: result.color, fontFamily: 'var(--font-display)' }}
                >
                  {result.label}
                </h3>

                <p className="text-text-secondary text-lg">
                  {result.prediction}
                </p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setResult(null)}
                  className="mt-6 px-6 py-2 rounded-full bg-surface-elevated text-text-primary font-medium"
                >
                  Spin Again
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
