import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, Trophy, RefreshCw } from 'lucide-react';
import { getRandomQuestions, type TriviaQuestion } from '@/data/trivia';
import { useConfetti } from '@/hooks/useConfetti';

export function TriviaGame() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setQuestions(getRandomQuestions(5));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameComplete(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
      fireConfetti();
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
      if (score >= 3) {
        fireConfetti();
      }
    }
  };

  if (questions.length === 0) {
    return null;
  }

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <Trophy
          size={64}
          className={`mx-auto mb-4 ${score >= 4 ? 'text-gold' : score >= 3 ? 'text-cyan' : 'text-text-muted'}`}
        />

        <h3
          className="text-2xl font-bold text-text-primary mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {score >= 4 ? 'Amazing!' : score >= 3 ? 'Great Job!' : 'Nice Try!'}
        </h3>

        <p className="text-text-secondary text-lg mb-6">
          You scored {score} out of {questions.length}!
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startNewGame}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple to-magenta text-white font-medium"
        >
          <RefreshCw size={18} />
          Play Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple" />
          <span className="text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gold font-bold">{score}</span>
          <span className="text-text-muted">pts</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-purple to-magenta"
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-surface-elevated rounded-2xl p-6"
        >
          <h4 className="text-lg font-medium text-text-primary mb-6">
            {currentQuestion.question}
          </h4>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctIndex;
              const isSelected = index === selectedAnswer;

              let buttonStyle = 'bg-surface hover:bg-border/30 text-text-primary';

              if (showResult) {
                if (isCorrect) {
                  buttonStyle = 'bg-green-500/20 border-green-500 text-green-400';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-red-500/20 border-red-500 text-red-400';
                } else {
                  buttonStyle = 'bg-surface/50 text-text-muted';
                }
              }

              return (
                <motion.button
                  key={index}
                  whileTap={!showResult ? { scale: 0.98 } : undefined}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl border-2 border-transparent transition-all
                    ${buttonStyle}
                    ${!showResult ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <span>{option}</span>
                  {showResult && isCorrect && (
                    <Check size={20} className="text-green-400" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <X size={20} className="text-red-400" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-surface"
              >
                <p className="text-text-secondary text-sm">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={nextQuestion}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple to-magenta text-white font-medium"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
