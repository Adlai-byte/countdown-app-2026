import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, ThumbsUp } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomWYRQuestions, type WYRQuestion } from '@/data/wouldYouRather';
import { useConfetti } from '@/hooks/useConfetti';

export function WouldYouRather() {
  const [questions, setQuestions] = useState<WYRQuestion[]>(() => getRandomWYRQuestions(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const { fireSmall } = useConfetti();

  const currentQuestion = questions[currentIndex];

  const handleVote = (option: 'a' | 'b') => {
    if (hasVoted) return;
    setVotes((prev) => ({
      ...prev,
      [option]: prev[option] + 1,
    }));
    setHasVoted(true);
    fireSmall();
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setVotes({ a: 0, b: 0 });
      setHasVoted(false);
    } else {
      // Reset with new questions
      setQuestions(getRandomWYRQuestions(10));
      setCurrentIndex(0);
      setVotes({ a: 0, b: 0 });
      setHasVoted(false);
    }
  }, [currentIndex, questions.length]);

  const totalVotes = votes.a + votes.b;
  const percentA = totalVotes > 0 ? Math.round((votes.a / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round((votes.b / totalVotes) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple" />
          <span className="text-sm text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-surface-elevated text-text-muted capitalize">
          {currentQuestion.category}
        </span>
      </div>

      {/* Question */}
      <Card variant="glass" className="text-center py-4">
        <h3 className="text-lg font-bold text-gold mb-1">Would You Rather...</h3>
      </Card>

      {/* Options */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Option A */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('a')}
              disabled={hasVoted}
              className={`
                w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden
                ${hasVoted ? 'cursor-default' : 'cursor-pointer'}
                ${hasVoted ? 'bg-cyan/20 border-2 border-cyan' : 'bg-gradient-to-r from-cyan/30 to-cyan/10 hover:from-cyan/40 hover:to-cyan/20'}
              `}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentA}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-cyan/30"
                />
              )}
              <div className="relative z-10 flex items-start gap-3">
                <span className="text-2xl font-bold text-cyan">A</span>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{currentQuestion.optionA}</p>
                  {hasVoted && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-cyan mt-2 font-bold"
                    >
                      {percentA}% ({votes.a} vote{votes.a !== 1 ? 's' : ''})
                    </motion.p>
                  )}
                </div>
                {hasVoted && votes.a > votes.b && (
                  <ThumbsUp size={20} className="text-cyan" />
                )}
              </div>
            </motion.button>

            {/* VS Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-lg font-bold text-gold">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Option B */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('b')}
              disabled={hasVoted}
              className={`
                w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden
                ${hasVoted ? 'cursor-default' : 'cursor-pointer'}
                ${hasVoted ? 'bg-magenta/20 border-2 border-magenta' : 'bg-gradient-to-r from-magenta/30 to-magenta/10 hover:from-magenta/40 hover:to-magenta/20'}
              `}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentB}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-magenta/30"
                />
              )}
              <div className="relative z-10 flex items-start gap-3">
                <span className="text-2xl font-bold text-magenta">B</span>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{currentQuestion.optionB}</p>
                  {hasVoted && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-magenta mt-2 font-bold"
                    >
                      {percentB}% ({votes.b} vote{votes.b !== 1 ? 's' : ''})
                    </motion.p>
                  )}
                </div>
                {hasVoted && votes.b > votes.a && (
                  <ThumbsUp size={20} className="text-magenta" />
                )}
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="primary" onClick={handleNext} className="w-full">
            <RefreshCw size={18} className="mr-2" />
            {currentIndex < questions.length - 1 ? 'Next Question' : 'New Game'}
          </Button>
        </motion.div>
      )}

      {/* Instructions */}
      <p className="text-xs text-center text-text-muted">
        Everyone votes, then discuss your choices!
      </p>
    </div>
  );
}
