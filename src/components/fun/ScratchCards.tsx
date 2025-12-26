import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getRandomPrediction } from '@/data/predictions';
import { useConfetti } from '@/hooks/useConfetti';

interface ScratchCard {
  id: number;
  prediction: string;
  isRevealed: boolean;
}

export function ScratchCards() {
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    resetCards();
  }, []);

  const resetCards = () => {
    setCards([
      { id: 1, prediction: getRandomPrediction(), isRevealed: false },
      { id: 2, prediction: getRandomPrediction(), isRevealed: false },
      { id: 3, prediction: getRandomPrediction(), isRevealed: false },
    ]);
  };

  const revealCard = (id: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isRevealed: true } : card
      )
    );
    fireConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => (
          <ScratchCardItem
            key={card.id}
            card={card}
            onReveal={() => revealCard(card.id)}
          />
        ))}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resetCards}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-elevated text-text-secondary hover:bg-border/30 transition-colors"
        >
          <RefreshCw size={18} />
          New Cards
        </motion.button>
      </div>
    </div>
  );
}

interface ScratchCardItemProps {
  card: ScratchCard;
  onReveal: () => void;
}

function ScratchCardItem({ card, onReveal }: ScratchCardItemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [, setScratchPercentage] = useState(0);

  useEffect(() => {
    if (card.isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with scratch-off coating
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal!', canvas.width / 2, canvas.height / 2);
  }, [card.isRevealed]);

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (card.isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();

    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const percentage = (transparent / (imageData.data.length / 4)) * 100;
    setScratchPercentage(percentage);

    // Auto-reveal if scratched enough
    if (percentage > 50 && !card.isRevealed) {
      onReveal();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-surface-elevated rounded-2xl overflow-hidden"
      style={{ minHeight: '120px' }}
    >
      {/* Prediction (hidden behind scratch layer) */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <AnimatePresence>
          {card.isRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Sparkles size={24} className="mx-auto mb-2 text-gold" />
              <p className="text-text-primary font-medium">{card.prediction}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scratch layer */}
      {!card.isRevealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          onMouseDown={() => setIsScratching(true)}
          onMouseUp={() => setIsScratching(false)}
          onMouseLeave={() => setIsScratching(false)}
          onMouseMove={(e) => isScratching && scratch(e)}
          onTouchStart={() => setIsScratching(true)}
          onTouchEnd={() => setIsScratching(false)}
          onTouchMove={(e) => scratch(e)}
        />
      )}

      {/* Quick reveal button */}
      {!card.isRevealed && (
        <button
          onClick={onReveal}
          className="absolute bottom-2 right-2 px-3 py-1 text-xs rounded-full bg-black/30 text-white/70 hover:bg-black/50 transition-colors"
        >
          Reveal
        </button>
      )}
    </motion.div>
  );
}
