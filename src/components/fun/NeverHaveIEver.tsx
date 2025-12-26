import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Wine, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomNeverHaveIEver, type NeverHaveIEverItem } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';

type Category = 'mild' | 'medium' | 'spicy' | 'all';

export function NeverHaveIEver() {
  const [category, setCategory] = useState<Category>('all');
  const [currentItem, setCurrentItem] = useState<NeverHaveIEverItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { fireSmall } = useConfetti();

  const categories: { id: Category; name: string; emoji: string; color: string }[] = [
    { id: 'all', name: 'All', emoji: '🎲', color: 'bg-purple' },
    { id: 'mild', name: 'Mild', emoji: '😇', color: 'bg-green-500' },
    { id: 'medium', name: 'Medium', emoji: '😏', color: 'bg-yellow-500' },
    { id: 'spicy', name: 'Spicy', emoji: '🔥', color: 'bg-red-500' },
  ];

  const getNext = useCallback(() => {
    const cat = category === 'all' ? undefined : category;
    setCurrentItem(getRandomNeverHaveIEver(cat));
    setRevealed(true);
    fireSmall();
  }, [category, fireSmall]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'mild': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'spicy': return 'text-red-500';
      default: return 'text-purple';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <Card variant="glass" className="p-4">
        <p className="text-sm text-text-secondary mb-3">Select Intensity:</p>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2 rounded-xl
                text-sm transition-all
                ${category === cat.id
                  ? `${cat.color} text-white`
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}
              `}
            >
              <span>{cat.emoji}</span>
              <span className="text-xs">{cat.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Card */}
      <Card variant="glass" className="py-8 text-center">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-4">🍷</div>
              <h3 className="text-xl font-bold text-text-primary">
                Never Have I Ever
              </h3>
              <p className="text-text-secondary text-sm px-4">
                Drink if you HAVE done it!
              </p>
              <Button variant="primary" onClick={getNext} className="px-8">
                <Sparkles size={18} className="mr-2" />
                Start Game
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={currentItem?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 px-4"
            >
              {/* Category Badge */}
              <div className={`text-sm font-medium ${getCategoryColor(currentItem?.category || '')}`}>
                {currentItem?.category.toUpperCase()}
              </div>

              {/* Statement */}
              <div className="py-6 px-4 rounded-2xl bg-surface-elevated">
                <p className="text-xl font-medium text-text-primary leading-relaxed">
                  {currentItem?.text}
                </p>
              </div>

              {/* Instructions */}
              <p className="text-text-muted text-sm flex items-center justify-center gap-2">
                <Wine size={16} />
                Drink if you have!
              </p>

              {/* Next Button */}
              <Button variant="primary" onClick={getNext} className="px-8">
                <RotateCcw size={18} className="mr-2" />
                Next Statement
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Read the statement out loud</li>
          <li>If you HAVE done it, take a drink!</li>
          <li>If you haven't, you're safe</li>
          <li>Be honest... or don't!</li>
        </ul>
      </Card>
    </div>
  );
}
