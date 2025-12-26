import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, Check, RotateCcw, Clock, Award } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import {
  getRandomWord,
  CHARADES_CATEGORIES,
  type CharadesCategory,
  type CharadesWord,
} from '@/data/charades';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const TICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

const ROUND_TIME = 60; // seconds

export function Charades() {
  const [category, setCategory] = useState<CharadesCategory>('nye');
  const [currentWord, setCurrentWord] = useState<CharadesWord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireSmall, fireCelebration } = useConfetti();

  const [playTick] = useSound(TICK_SOUND, { volume: 0.2 });
  const [playSuccess] = useSound(SUCCESS_SOUND, { volume: 0.4 });

  const getNewWord = useCallback(() => {
    const word = getRandomWord(category);
    setCurrentWord(word);
  }, [category]);

  const startRound = useCallback(() => {
    setIsPlaying(true);
    setTimeLeft(ROUND_TIME);
    setScore(0);
    setSkipped(0);
    setRoundComplete(false);
    getNewWord();
  }, [getNewWord]);

  const endRound = useCallback(() => {
    setIsPlaying(false);
    setRoundComplete(true);
    if (score > 0) {
      fireCelebration();
    }
  }, [score, fireCelebration]);

  const handleCorrect = () => {
    setScore((prev) => prev + 1);
    playSuccess();
    fireSmall();
    getNewWord();
  };

  const handleSkip = () => {
    setSkipped((prev) => prev + 1);
    getNewWord();
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      endRound();
      return;
    }

    // Play tick sound for last 10 seconds
    if (timeLeft <= 10) {
      playTick();
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeLeft, endRound, playTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      {!isPlaying && !roundComplete && (
        <Card variant="glass" className="p-4">
          <p className="text-sm text-text-secondary mb-3">Select Category:</p>
          <div className="flex flex-wrap gap-2">
            {CHARADES_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  text-sm font-medium transition-all
                  ${category === cat.id
                    ? 'bg-purple text-white'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}
                `}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Game Area */}
      <Card variant="glass" className="text-center py-8">
        <AnimatePresence mode="wait">
          {!isPlaying && !roundComplete ? (
            // Ready State
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-6xl mb-4">
                {CHARADES_CATEGORIES.find((c) => c.id === category)?.emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {CHARADES_CATEGORIES.find((c) => c.id === category)?.name} Charades
                </h3>
                <p className="text-text-secondary text-sm">
                  Act out the word without speaking!
                </p>
              </div>
              <Button variant="primary" onClick={startRound} className="px-8">
                <Play size={20} className="mr-2" />
                Start Round
              </Button>
            </motion.div>
          ) : isPlaying && currentWord ? (
            // Playing State
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              {/* Timer */}
              <div className={`
                flex items-center justify-center gap-2 text-3xl font-bold
                ${timeLeft <= 10 ? 'text-red-500' : 'text-gold'}
              `}>
                <Clock size={28} />
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {formatTime(timeLeft)}
                </motion.span>
              </div>

              {/* Score */}
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-green-500">
                  <Check size={16} className="inline mr-1" />
                  {score} correct
                </span>
                <span className="text-text-muted">
                  <SkipForward size={16} className="inline mr-1" />
                  {skipped} skipped
                </span>
              </div>

              {/* Word Display */}
              <motion.div
                key={currentWord.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple/20 to-magenta/20 border-2 border-purple"
              >
                <p className="text-sm text-text-muted mb-2">ACT OUT:</p>
                <h2 className="text-3xl font-bold text-text-primary">
                  {currentWord.word}
                </h2>
                <p className="text-xs text-text-muted mt-2 capitalize">
                  {currentWord.difficulty}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={handleSkip}
                  className="px-6 bg-surface-elevated"
                >
                  <SkipForward size={18} className="mr-2" />
                  Skip
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCorrect}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  <Check size={18} className="mr-2" />
                  Correct!
                </Button>
              </div>
            </motion.div>
          ) : (
            // Round Complete
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      {!isPlaying && !roundComplete && (
        <Card variant="glass" className="p-4">
          <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            <li>Hold the phone so only YOU can see the word</li>
            <li>Act out the word - no speaking or pointing!</li>
            <li>Others guess - tap "Correct" when they get it</li>
            <li>Tap "Skip" if it's too hard (no penalty)</li>
            <li>Get as many as possible in 60 seconds!</li>
          </ol>
        </Card>
      )}

      {/* Round Complete Modal */}
      <Modal isOpen={roundComplete} onClose={() => setRoundComplete(false)}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center">
            <Award size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary">Round Over!</h3>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{score}</p>
              <p className="text-sm text-text-muted">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-muted">{skipped}</p>
              <p className="text-sm text-text-muted">Skipped</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setRoundComplete(false)}
              className="flex-1"
            >
              Done
            </Button>
            <Button variant="primary" onClick={startRound} className="flex-1">
              <RotateCcw size={18} className="mr-2" />
              Play Again
            </Button>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
}
