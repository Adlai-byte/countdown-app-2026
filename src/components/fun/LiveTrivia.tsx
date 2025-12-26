import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, X, Check, ChevronRight, Settings2 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { fetchTriviaQuestions, TRIVIA_CATEGORIES, decodeHtml, type TriviaQuestion } from '@/services/partyApi';
import { useConfetti } from '@/hooks/useConfetti';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  questions: TriviaQuestion[];
  currentIndex: number;
  score: number;
  answers: (string | null)[];
  isComplete: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'from-green-500 to-emerald-500',
  medium: 'from-yellow-500 to-orange-500',
  hard: 'from-red-500 to-rose-500',
};

export function LiveTrivia() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  // Settings
  const [showSettings, setShowSettings] = useState(true);
  const [category, setCategory] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);

  const { fireCelebration } = useConfetti();

  const startGame = async () => {
    setLoading(true);
    setShowSettings(false);

    try {
      const questions = await fetchTriviaQuestions(questionCount, category, difficulty);
      setGameState({
        questions,
        currentIndex: 0,
        score: 0,
        answers: [],
        isComplete: false,
      });
    } catch {
      // Show error
      setShowSettings(true);
    } finally {
      setLoading(false);
    }
  };

  // Shuffle answers when question changes
  useEffect(() => {
    if (gameState && gameState.questions[gameState.currentIndex]) {
      const q = gameState.questions[gameState.currentIndex];
      const answers = [...q.incorrect_answers, q.correct_answer];
      setShuffledAnswers(answers.sort(() => Math.random() - 0.5));
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [gameState?.currentIndex, gameState?.questions]);

  const handleAnswer = (answer: string) => {
    if (showResult || !gameState) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const currentQ = gameState.questions[gameState.currentIndex];
    const isCorrect = answer === currentQ.correct_answer;

    if (isCorrect) {
      fireCelebration();
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: [...prev.answers, answer],
      };
    });
  };

  const nextQuestion = () => {
    if (!gameState) return;

    if (gameState.currentIndex >= gameState.questions.length - 1) {
      setGameState((prev) => prev ? { ...prev, isComplete: true } : prev);
      if (gameState.score >= gameState.questions.length * 0.7) {
        fireCelebration();
      }
    } else {
      setGameState((prev) => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : prev);
    }
  };

  const resetGame = () => {
    setGameState(null);
    setShowSettings(true);
  };

  const currentQuestion = gameState?.questions[gameState.currentIndex];

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Settings Screen */}
        {showSettings && !loading && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card variant="glass" className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🧠</div>
                <h3 className="text-xl font-bold text-text-primary">Live Trivia</h3>
                <p className="text-text-secondary">Powered by Open Trivia DB</p>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm text-text-muted mb-2 block">Category</label>
                <select
                  value={category ?? ''}
                  onChange={(e) => setCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
                >
                  <option value="">Any Category</option>
                  {TRIVIA_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="mb-4">
                <label className="text-sm text-text-muted mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        difficulty === d
                          ? `bg-gradient-to-r ${DIFFICULTY_COLORS[d]} text-white`
                          : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="mb-6">
                <label className="text-sm text-text-muted mb-2 block">Questions: {questionCount}</label>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button variant="primary" onClick={startGame} className="w-full">
                <Brain size={18} className="mr-2" />
                Start Trivia
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="glass" className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={48} className="text-purple mx-auto" />
              </motion.div>
              <p className="text-text-secondary mt-4">Loading questions...</p>
            </Card>
          </motion.div>
        )}

        {/* Game Screen */}
        {gameState && !gameState.isComplete && currentQuestion && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                Question {gameState.currentIndex + 1}/{gameState.questions.length}
              </span>
              <span className="text-gold font-medium">
                Score: {gameState.score}
              </span>
            </div>

            <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((gameState.currentIndex + 1) / gameState.questions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple to-magenta"
              />
            </div>

            {/* Question Card */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${DIFFICULTY_COLORS[currentQuestion.difficulty as Difficulty]} text-white`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-text-muted">
                  {decodeHtml(currentQuestion.category)}
                </span>
              </div>

              <h3 className="text-lg font-medium text-text-primary mb-6">
                {decodeHtml(currentQuestion.question)}
              </h3>

              {/* Answers */}
              <div className="space-y-2">
                {shuffledAnswers.map((answer, i) => {
                  const isCorrect = answer === currentQuestion.correct_answer;
                  const isSelected = answer === selectedAnswer;

                  let buttonClass = 'bg-surface-elevated hover:bg-border/50 text-text-primary';
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-500/20 border-2 border-green-500 text-green-400';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-red-500/20 border-2 border-red-500 text-red-400';
                    } else {
                      buttonClass = 'bg-surface-elevated/50 text-text-muted';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(answer)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${buttonClass}`}
                    >
                      <span>{decodeHtml(answer)}</span>
                      {showResult && isCorrect && <Check size={20} className="text-green-500" />}
                      {showResult && isSelected && !isCorrect && <X size={20} className="text-red-500" />}
                    </motion.button>
                  );
                })}
              </div>
            </Card>

            {/* Next Button */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button variant="primary" onClick={nextQuestion} className="w-full">
                  {gameState.currentIndex >= gameState.questions.length - 1 ? 'See Results' : 'Next Question'}
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Results Screen */}
        {gameState?.isComplete && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Card variant="glass" className="p-8 text-center">
              <div className="text-6xl mb-4">
                {gameState.score >= gameState.questions.length * 0.8 ? '🏆' :
                 gameState.score >= gameState.questions.length * 0.5 ? '🎉' : '👏'}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Game Complete!
              </h3>
              <p className="text-4xl font-bold text-gold mb-2">
                {gameState.score}/{gameState.questions.length}
              </p>
              <p className="text-text-secondary">
                {gameState.score === gameState.questions.length ? 'Perfect Score!' :
                 gameState.score >= gameState.questions.length * 0.8 ? 'Amazing!' :
                 gameState.score >= gameState.questions.length * 0.5 ? 'Good job!' : 'Nice try!'}
              </p>
            </Card>

            {/* Score Breakdown */}
            <Card variant="glass" className="p-4">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">{gameState.score}</p>
                  <p className="text-xs text-text-muted">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{gameState.questions.length - gameState.score}</p>
                  <p className="text-xs text-text-muted">Wrong</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple">{Math.round((gameState.score / gameState.questions.length) * 100)}%</p>
                  <p className="text-xs text-text-muted">Accuracy</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={resetGame} className="flex-1">
                <Settings2 size={18} className="mr-2" />
                Settings
              </Button>
              <Button variant="primary" onClick={startGame} className="flex-1">
                <RefreshCw size={18} className="mr-2" />
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Credit */}
      <Card variant="glass" className="p-3 text-center">
        <p className="text-xs text-text-muted">
          Powered by Open Trivia Database
        </p>
      </Card>
    </div>
  );
}
