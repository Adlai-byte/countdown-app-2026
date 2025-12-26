import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Pause, Volume2, Trophy } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { generateBingoCard, checkBingo, type BingoItem, BINGO_ITEMS } from '@/data/bingo';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const CALL_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

export function Bingo() {
  const [grid, setGrid] = useState<BingoItem[]>(() => generateBingoCard());
  const [marked, setMarked] = useState<Set<string>>(new Set(['free']));
  const [calledItems, setCalledItems] = useState<BingoItem[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [isAutoCalling, setIsAutoCalling] = useState(false);
  const [currentCall, setCurrentCall] = useState<BingoItem | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireCelebration } = useConfetti();

  const [playCall] = useSound(CALL_SOUND, { volume: 0.5 });

  // Available items that haven't been called yet
  const availableItems = BINGO_ITEMS.filter(
    (item) => !calledItems.find((c) => c.id === item.id)
  );

  const callNextItem = useCallback(() => {
    if (availableItems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const item = availableItems[randomIndex];
    setCurrentCall(item);
    setCalledItems((prev) => [...prev, item]);
    playCall();
  }, [availableItems, playCall]);

  // Auto-caller interval
  useEffect(() => {
    if (isAutoCalling && availableItems.length > 0 && !hasWon) {
      intervalRef.current = setInterval(callNextItem, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoCalling, availableItems.length, hasWon, callNextItem]);

  const toggleMark = (item: BingoItem) => {
    if (item.id === 'free' || hasWon) return;

    // Check if item has been called
    if (!calledItems.find((c) => c.id === item.id)) return;

    const newMarked = new Set(marked);
    if (marked.has(item.id)) {
      newMarked.delete(item.id);
    } else {
      newMarked.add(item.id);
    }
    setMarked(newMarked);

    // Check for win
    if (checkBingo(newMarked, grid)) {
      setHasWon(true);
      setIsAutoCalling(false);
      fireCelebration();
    }
  };

  const resetGame = () => {
    setGrid(generateBingoCard());
    setMarked(new Set(['free']));
    setCalledItems([]);
    setCurrentCall(null);
    setHasWon(false);
    setIsAutoCalling(false);
  };

  const toggleAutoCalling = () => {
    if (!isAutoCalling && availableItems.length > 0) {
      // Start auto-calling immediately with first call
      callNextItem();
    }
    setIsAutoCalling(!isAutoCalling);
  };

  return (
    <div className="space-y-4">
      {/* Current Call */}
      <Card variant="glass" className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Volume2 size={18} className="text-gold" />
          <span className="text-sm text-text-secondary">Current Call</span>
        </div>
        <AnimatePresence mode="wait">
          {currentCall ? (
            <motion.div
              key={currentCall.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-3xl"
            >
              <span className="mr-2">{currentCall.emoji}</span>
              <span className="font-bold text-gold">{currentCall.text}</span>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-muted"
            >
              Press "Call" or start Auto-Caller
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-xs text-text-muted mt-2">
          {calledItems.length} / {BINGO_ITEMS.length} called
        </p>
      </Card>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={callNextItem}
          disabled={availableItems.length === 0 || hasWon || isAutoCalling}
          className="flex-1"
        >
          <Volume2 size={18} className="mr-2" />
          Call
        </Button>
        <Button
          variant={isAutoCalling ? 'primary' : 'secondary'}
          onClick={toggleAutoCalling}
          disabled={availableItems.length === 0 || hasWon}
          className="flex-1"
        >
          {isAutoCalling ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
          {isAutoCalling ? 'Pause' : 'Auto'}
        </Button>
        <Button variant="ghost" onClick={resetGame}>
          <RotateCcw size={18} />
        </Button>
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {grid.map((item, index) => {
          const isMarked = marked.has(item.id);
          const isCalled = calledItems.find((c) => c.id === item.id) || item.id === 'free';

          return (
            <motion.button
              key={`${item.id}-${index}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMark(item)}
              disabled={!isCalled || hasWon}
              className={`
                aspect-square rounded-lg p-1 flex flex-col items-center justify-center
                transition-all text-center
                ${isMarked
                  ? 'bg-gradient-to-br from-purple to-magenta text-white shadow-lg shadow-purple/30'
                  : isCalled
                    ? 'bg-surface-elevated hover:bg-border/50 text-text-primary'
                    : 'bg-surface opacity-50 text-text-muted cursor-not-allowed'}
              `}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="text-[8px] leading-tight mt-0.5 line-clamp-1">{item.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Called Items History */}
      <Card variant="glass" className="p-3">
        <p className="text-xs text-text-muted mb-2">Called Items:</p>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {calledItems.length === 0 ? (
            <span className="text-xs text-text-muted">None yet</span>
          ) : (
            calledItems.map((item) => (
              <span
                key={item.id}
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${marked.has(item.id) ? 'bg-purple/30 text-purple' : 'bg-surface-elevated text-text-muted'}
                `}
              >
                {item.emoji}
              </span>
            ))
          )}
        </div>
      </Card>

      {/* Win Modal */}
      <Modal isOpen={hasWon} onClose={resetGame}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gold">BINGO!</h3>
          <p className="text-text-secondary">
            Congratulations! You got 5 in a row!
          </p>
          <Button variant="primary" onClick={resetGame}>
            <RotateCcw size={18} className="mr-2" />
            Play Again
          </Button>
        </motion.div>
      </Modal>
    </div>
  );
}
