import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  points: number;
}

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6',
  '#e91e63', '#00bcd4', '#ff9800', '#8bc34a', '#673ab7',
];

const GAME_DURATION = 30; // seconds

export function BalloonPop() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('balloonPopHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [poppedCount, setPoppedCount] = useState(0);
  const { fireCelebration } = useConfetti();

  // Generate a new balloon
  const spawnBalloon = useCallback(() => {
    const isGolden = Math.random() < 0.1; // 10% chance for golden balloon
    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // 10-90%
      y: 110, // Start below screen
      color: isGolden ? '#ffd700' : COLORS[Math.floor(Math.random() * COLORS.length)],
      size: isGolden ? 70 : Math.random() * 20 + 50, // 50-70px, golden is bigger
      speed: Math.random() * 1.5 + 1, // 1-2.5
      points: isGolden ? 50 : 10,
    };
    setBalloons((prev) => [...prev, newBalloon]);
  }, []);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBalloons([]);
    setPoppedCount(0);
  };

  // Pop a balloon
  const popBalloon = (id: number, points: number) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setScore((prev) => prev + points);
    setPoppedCount((prev) => prev + 1);

    // Golden balloon celebration
    if (points >= 50) {
      fireCelebration();
    }
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('ended');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Balloon spawner
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawner = setInterval(() => {
      spawnBalloon();
    }, 800); // Spawn every 800ms

    return () => clearInterval(spawner);
  }, [gameState, spawnBalloon]);

  // Move balloons up
  useEffect(() => {
    if (gameState !== 'playing') return;

    const mover = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20) // Remove balloons that went off screen
      );
    }, 50);

    return () => clearInterval(mover);
  }, [gameState]);

  // Save high score
  useEffect(() => {
    if (gameState === 'ended' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('balloonPopHighScore', score.toString());
      fireCelebration();
    }
  }, [gameState, score, highScore, fireCelebration]);

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <Card variant="glass" className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-gold">{score}</p>
            <p className="text-xs text-text-muted">Score</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-text-primary'}`}>
              {timeLeft}s
            </p>
            <p className="text-xs text-text-muted">Time</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple">{highScore}</p>
            <p className="text-xs text-text-muted">Best</p>
          </div>
        </div>
      </Card>

      {/* Game Area */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 relative overflow-hidden h-[400px]">
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-6xl mb-4">🎈</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Balloon Pop!</h3>
              <p className="text-text-secondary mb-6 text-center px-4">
                Pop as many balloons as you can!<br />
                <span className="text-gold">Golden balloons = 50 pts!</span>
              </p>
              <Button variant="primary" onClick={startGame}>
                <Play size={18} className="mr-2" />
                Start Game
              </Button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <>
              {balloons.map((balloon) => (
                <motion.button
                  key={balloon.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => popBalloon(balloon.id, balloon.points)}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${balloon.x}%`,
                    top: `${balloon.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      width: balloon.size,
                      height: balloon.size * 1.2,
                      background: `radial-gradient(circle at 30% 30%, ${balloon.color}dd, ${balloon.color})`,
                      boxShadow: balloon.points >= 50 ? '0 0 20px #ffd700' : undefined,
                    }}
                  >
                    {balloon.points >= 50 && (
                      <span className="text-2xl">⭐</span>
                    )}
                  </div>
                  {/* Balloon string */}
                  <div
                    className="w-0.5 mx-auto"
                    style={{
                      height: 20,
                      background: balloon.color,
                    }}
                  />
                </motion.button>
              ))}
            </>
          )}

          {gameState === 'ended' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm"
            >
              <div className="text-6xl mb-4">
                {score > highScore ? '🏆' : score >= 200 ? '🎉' : '🎈'}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                {score > highScore ? 'New High Score!' : 'Game Over!'}
              </h3>
              <p className="text-4xl font-bold text-gold mb-2">{score}</p>
              <p className="text-text-muted mb-6">
                {poppedCount} balloons popped
              </p>
              <Button variant="primary" onClick={startGame}>
                <RotateCcw size={18} className="mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-5 rounded-full bg-red-500" />
            <span>10 pts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-6 rounded-full bg-gold flex items-center justify-center text-xs">⭐</div>
            <span>50 pts</span>
          </div>
          <div className="flex-1 text-right">
            <Trophy size={14} className="inline mr-1" />
            Best: {highScore}
          </div>
        </div>
      </Card>
    </div>
  );
}
