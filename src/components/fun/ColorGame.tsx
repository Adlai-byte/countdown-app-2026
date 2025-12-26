import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap, Heart } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import {
  GAME_COLORS,
  GAME_MODES,
  getRandomColors,
  generateSequence,
  getDifficultySettings,
  type GameColor,
  type GameMode,
} from '@/data/colorGame';
import { useConfetti } from '@/hooks/useConfetti';
import useSound from 'use-sound';

const CORRECT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
const WRONG_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2691/2691-preview.mp3';

export function ColorGame() {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [targetColor, setTargetColor] = useState<GameColor | null>(null);
  const [options, setOptions] = useState<GameColor[]>([]);
  const [timeLeft, setTimeLeft] = useState(5000);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('colorGame_highScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Memory mode state
  const [memorySequence, setMemorySequence] = useState<GameColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<GameColor[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentShowIndex, setCurrentShowIndex] = useState(-1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireSmall, fireCelebration } = useConfetti();

  const [playCorrect] = useSound(CORRECT_SOUND, { volume: 0.4 });
  const [playWrong] = useSound(WRONG_SOUND, { volume: 0.4 });

  const settings = getDifficultySettings(level);

  // Setup next round for classic/speed mode
  const setupRound = useCallback(() => {
    const target = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    const otherColors = getRandomColors(settings.optionCount - 1, target.id);
    const allOptions = [target, ...otherColors].sort(() => Math.random() - 0.5);

    setTargetColor(target);
    setOptions(allOptions);
    setTimeLeft(settings.timeLimit);
    setShowResult(null);
  }, [settings.optionCount, settings.timeLimit]);

  // Setup memory round
  const setupMemoryRound = useCallback(() => {
    const sequenceLength = Math.min(3 + Math.floor(level / 2), 8);
    const sequence = generateSequence(sequenceLength);
    setMemorySequence(sequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    setCurrentShowIndex(0);
  }, [level]);

  // Start game
  const startGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    setLives(3);
    setStreak(0);
    setGameOver(false);

    if (gameMode === 'memory') {
      setupMemoryRound();
    } else {
      setupRound();
    }
  }, [gameMode, setupRound, setupMemoryRound]);

  // Handle color selection for classic/speed mode
  const handleColorSelect = useCallback(
    (color: GameColor) => {
      if (!isPlaying || showResult || !targetColor) return;

      if (color.id === targetColor.id) {
        // Correct!
        const timeBonus = Math.floor((timeLeft / settings.timeLimit) * settings.speedBonus);
        const streakBonus = streak * 10;
        const points = 100 + timeBonus + streakBonus;

        setScore((prev) => prev + points);
        setStreak((prev) => prev + 1);
        setShowResult('correct');
        playCorrect();
        fireSmall();

        // Level up every 5 correct answers
        if ((streak + 1) % 5 === 0) {
          setLevel((prev) => prev + 1);
        }

        setTimeout(() => {
          setupRound();
        }, 500);
      } else {
        // Wrong!
        setShowResult('wrong');
        setStreak(0);
        setLives((prev) => prev - 1);
        playWrong();

        if (lives <= 1) {
          endGame();
        } else {
          setTimeout(() => {
            setupRound();
          }, 500);
        }
      }
    },
    [
      isPlaying,
      showResult,
      targetColor,
      timeLeft,
      settings.timeLimit,
      settings.speedBonus,
      streak,
      lives,
      playCorrect,
      playWrong,
      fireSmall,
      setupRound,
    ]
  );

  // Handle memory mode selection
  const handleMemorySelect = useCallback(
    (color: GameColor) => {
      if (!isPlaying || showingSequence) return;

      const newPlayerSequence = [...playerSequence, color];
      setPlayerSequence(newPlayerSequence);

      const expectedColor = memorySequence[newPlayerSequence.length - 1];

      if (color.id !== expectedColor.id) {
        // Wrong!
        setShowResult('wrong');
        setStreak(0);
        setLives((prev) => prev - 1);
        playWrong();

        if (lives <= 1) {
          endGame();
        } else {
          setTimeout(() => {
            setupMemoryRound();
          }, 1000);
        }
        return;
      }

      // Correct so far
      playCorrect();
      fireSmall();

      if (newPlayerSequence.length === memorySequence.length) {
        // Completed sequence!
        setScore((prev) => prev + 100 * memorySequence.length);
        setStreak((prev) => prev + 1);
        setLevel((prev) => prev + 1);
        setShowResult('correct');

        setTimeout(() => {
          setupMemoryRound();
        }, 1000);
      }
    },
    [
      isPlaying,
      showingSequence,
      playerSequence,
      memorySequence,
      lives,
      playCorrect,
      playWrong,
      fireSmall,
      setupMemoryRound,
    ]
  );

  // End game
  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorGame_highScore', score.toString());
      fireCelebration();
    }
  }, [score, highScore, fireCelebration]);

  // Timer for classic/speed mode
  useEffect(() => {
    if (!isPlaying || gameMode === 'memory' || showResult) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          // Time's up!
          setShowResult('wrong');
          setStreak(0);
          setLives((l) => l - 1);
          playWrong();

          if (lives <= 1) {
            endGame();
          } else {
            setTimeout(() => {
              setupRound();
            }, 500);
          }
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, gameMode, showResult, lives, playWrong, endGame, setupRound]);

  // Memory sequence display
  useEffect(() => {
    if (!showingSequence || currentShowIndex < 0) return;

    if (currentShowIndex >= memorySequence.length) {
      setShowingSequence(false);
      setCurrentShowIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentShowIndex((prev) => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [showingSequence, currentShowIndex, memorySequence.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const timePercent = (timeLeft / settings.timeLimit) * 100;

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      {!isPlaying && !gameOver && (
        <Card variant="glass" className="p-4">
          <p className="text-sm text-text-secondary mb-3">Select Mode:</p>
          <div className="flex gap-2">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setGameMode(mode.id)}
                className={`
                  flex-1 flex flex-col items-center gap-1 p-3 rounded-xl
                  text-sm transition-all
                  ${
                    gameMode === mode.id
                      ? 'bg-purple text-white'
                      : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <span className="text-xl">{mode.emoji}</span>
                <span className="font-medium">{mode.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Game Stats */}
      {isPlaying && (
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy size={16} className="text-gold" />
              <span className="font-bold text-text-primary">{score}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={16} className="text-purple" />
              <span className="text-text-secondary">x{streak}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Lv.{level}</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  size={18}
                  className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer Bar */}
      {isPlaying && gameMode !== 'memory' && (
        <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              timePercent > 50 ? 'bg-green-500' : timePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Game Area */}
      <Card variant="glass" className="py-8">
        <AnimatePresence mode="wait">
          {!isPlaying && !gameOver ? (
            // Start Screen
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="text-5xl">
                {GAME_MODES.find((m) => m.id === gameMode)?.emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  {GAME_MODES.find((m) => m.id === gameMode)?.name} Mode
                </h3>
                <p className="text-text-secondary">
                  {GAME_MODES.find((m) => m.id === gameMode)?.description}
                </p>
              </div>
              {highScore > 0 && (
                <p className="text-sm text-gold">
                  High Score: {highScore}
                </p>
              )}
              <Button variant="primary" onClick={startGame} className="px-8">
                <Play size={20} className="mr-2" />
                Start Game
              </Button>
            </motion.div>
          ) : isPlaying ? (
            // Playing
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Target Color Display */}
              {gameMode !== 'memory' && targetColor && (
                <div className="text-center">
                  <p className="text-sm text-text-muted mb-2">TAP THE COLOR:</p>
                  <motion.div
                    key={targetColor.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`
                      w-20 h-20 mx-auto rounded-2xl shadow-lg
                      ${showResult === 'correct' ? 'ring-4 ring-green-500' : ''}
                      ${showResult === 'wrong' ? 'ring-4 ring-red-500' : ''}
                    `}
                    style={{ backgroundColor: targetColor.hex }}
                  />
                  <p className="text-lg font-bold text-text-primary mt-2">
                    {targetColor.name}
                  </p>
                </div>
              )}

              {/* Memory Sequence Display */}
              {gameMode === 'memory' && showingSequence && (
                <div className="text-center">
                  <p className="text-sm text-text-muted mb-2">REMEMBER:</p>
                  <motion.div
                    key={currentShowIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 mx-auto rounded-2xl shadow-lg"
                    style={{
                      backgroundColor:
                        currentShowIndex >= 0 && currentShowIndex < memorySequence.length
                          ? memorySequence[currentShowIndex].hex
                          : 'transparent',
                    }}
                  />
                  <p className="text-lg font-bold text-text-primary mt-2">
                    {currentShowIndex + 1} / {memorySequence.length}
                  </p>
                </div>
              )}

              {/* Memory Mode - Your Turn */}
              {gameMode === 'memory' && !showingSequence && (
                <div className="text-center">
                  <p className="text-sm text-text-muted mb-2">YOUR TURN:</p>
                  <div className="flex justify-center gap-2 mb-2">
                    {playerSequence.map((color, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                    {[...Array(memorySequence.length - playerSequence.length)].map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {playerSequence.length} / {memorySequence.length}
                  </p>
                </div>
              )}

              {/* Color Options */}
              <div
                className={`
                  grid gap-3 px-4
                  ${options.length <= 4 ? 'grid-cols-2' : 'grid-cols-4'}
                `}
              >
                {(gameMode === 'memory' ? GAME_COLORS.slice(0, 6) : options).map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      gameMode === 'memory'
                        ? handleMemorySelect(color)
                        : handleColorSelect(color)
                    }
                    disabled={showResult !== null || (gameMode === 'memory' && showingSequence)}
                    className={`
                      aspect-square rounded-xl shadow-lg transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              {/* Result Overlay */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`
                      absolute inset-0 flex items-center justify-center
                      ${showResult === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}
                    `}
                  >
                    <span className="text-6xl">
                      {showResult === 'correct' ? '✓' : '✗'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>

      {/* Game Over Modal */}
      <Modal isOpen={gameOver} onClose={() => setGameOver(false)}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary">Game Over!</h3>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple">{score}</p>
              <p className="text-sm text-text-muted">Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gold">{level}</p>
              <p className="text-sm text-text-muted">Level</p>
            </div>
          </div>

          {score >= highScore && score > 0 && (
            <p className="text-gold font-medium">New High Score!</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setGameOver(false)}
              className="flex-1"
            >
              Done
            </Button>
            <Button variant="primary" onClick={startGame} className="flex-1">
              <RotateCcw size={18} className="mr-2" />
              Play Again
            </Button>
          </div>
        </motion.div>
      </Modal>

      {/* Instructions */}
      {!isPlaying && !gameOver && (
        <Card variant="glass" className="p-4">
          <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
            {gameMode === 'classic' && (
              <>
                <li>Match the target color before time runs out</li>
                <li>Build streaks for bonus points</li>
                <li>You have 3 lives - don't miss!</li>
              </>
            )}
            {gameMode === 'memory' && (
              <>
                <li>Watch the color sequence carefully</li>
                <li>Repeat the sequence in order</li>
                <li>Sequences get longer as you level up</li>
              </>
            )}
            {gameMode === 'speed' && (
              <>
                <li>Same as classic but faster!</li>
                <li>Timer gets shorter each level</li>
                <li>Quick reactions = more points</li>
              </>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
