import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Crown, HelpCircle } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { drawCard, KINGS_RULES, type KingsRule } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';

const CARD_SUITS = ['♠️', '♥️', '♦️', '♣️'];
const CARD_COLORS: Record<string, string> = {
  '♠️': 'text-gray-800',
  '♣️': 'text-gray-800',
  '♥️': 'text-red-500',
  '♦️': 'text-red-500',
};

export function Kings() {
  const [currentCard, setCurrentCard] = useState<KingsRule | null>(null);
  const [currentSuit, setCurrentSuit] = useState<string>('');
  const [kingsDrawn, setKingsDrawn] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const { fireSmall, fireCelebration } = useConfetti();

  const draw = useCallback(() => {
    setIsDrawing(true);

    // Animate card flip
    setTimeout(() => {
      const card = drawCard();
      const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
      setCurrentCard(card);
      setCurrentSuit(suit);
      setIsDrawing(false);

      if (card.card === 'K') {
        const newKingsCount = kingsDrawn + 1;
        setKingsDrawn(newKingsCount);
        if (newKingsCount === 4) {
          fireCelebration();
        } else {
          fireSmall();
        }
      } else {
        fireSmall();
      }
    }, 300);
  }, [kingsDrawn, fireSmall, fireCelebration]);

  const resetGame = () => {
    setCurrentCard(null);
    setCurrentSuit('');
    setKingsDrawn(0);
  };

  return (
    <div className="space-y-4">
      {/* Kings Counter */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-gold" />
          <span className="text-text-primary font-medium">
            Kings: {kingsDrawn}/4
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowRules(true)} className="text-sm">
            <HelpCircle size={16} className="mr-1" />
            Rules
          </Button>
          <Button variant="ghost" onClick={resetGame} className="text-sm">
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Kings Progress */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={i <= kingsDrawn ? { scale: [1, 1.2, 1] } : {}}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-lg
              ${i <= kingsDrawn
                ? 'bg-gradient-to-br from-gold to-yellow-600 text-white'
                : 'bg-surface-elevated text-text-muted'}
            `}
          >
            👑
          </motion.div>
        ))}
      </div>

      {/* Card Display */}
      <Card variant="glass" className="py-8">
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {isDrawing ? (
              <motion.div
                key="drawing"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                className="w-32 h-44 rounded-xl bg-gradient-to-br from-purple to-magenta flex items-center justify-center"
              >
                <span className="text-4xl text-white">?</span>
              </motion.div>
            ) : currentCard ? (
              <motion.div
                key={`${currentCard.card}-${currentSuit}`}
                initial={{ rotateY: 180, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                className="w-32 h-44 rounded-xl bg-white shadow-xl flex flex-col items-center justify-between p-3"
              >
                <div className={`self-start text-2xl font-bold ${CARD_COLORS[currentSuit]}`}>
                  {currentCard.card}
                  <span className="text-lg ml-1">{currentSuit}</span>
                </div>
                <div className="text-4xl">{currentCard.emoji}</div>
                <div className={`self-end text-2xl font-bold rotate-180 ${CARD_COLORS[currentSuit]}`}>
                  {currentCard.card}
                  <span className="text-lg ml-1">{currentSuit}</span>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="deck"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={draw}
                className="w-32 h-44 rounded-xl bg-gradient-to-br from-purple to-magenta flex items-center justify-center shadow-xl"
              >
                <span className="text-white text-lg font-medium">Tap to Draw</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Current Rule */}
        {currentCard && !isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center px-4"
          >
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {currentCard.name}
            </h3>
            <p className="text-text-secondary">
              {currentCard.rule}
            </p>

            {currentCard.card === 'K' && kingsDrawn === 4 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 text-xl font-bold text-gold"
              >
                🍺 DRINK THE KING'S CUP! 🍺
              </motion.p>
            )}
          </motion.div>
        )}
      </Card>

      {/* Draw Button */}
      {currentCard && !isDrawing && (
        <Button variant="primary" onClick={draw} className="w-full">
          Draw Next Card
        </Button>
      )}

      {/* Rules Modal */}
      <Modal isOpen={showRules} onClose={() => setShowRules(false)}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Crown size={24} className="text-gold" />
            Kings Rules
          </h3>

          <div className="space-y-3">
            {KINGS_RULES.map((rule) => (
              <div key={rule.card} className="flex gap-3 p-3 bg-surface-elevated rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-gray-800 shrink-0">
                  {rule.card}
                </div>
                <div>
                  <p className="font-medium text-text-primary flex items-center gap-2">
                    <span>{rule.emoji}</span>
                    {rule.name}
                  </p>
                  <p className="text-sm text-text-secondary">{rule.rule}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" onClick={() => setShowRules(false)} className="w-full">
            Got it!
          </Button>
        </div>
      </Modal>
    </div>
  );
}
