import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RefreshCw, X, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui';
import { PlayerAvatar } from '@/components/multiplayer';
import type { WYRPlayerStats, PersonalityInsight } from '@/utils/wyrInsights';
import {
  generateInsights,
  generateFunFacts,
  getPersonalityType,
} from '@/utils/wyrInsights';

interface WYRSummaryProps {
  playerStats: WYRPlayerStats;
  allPlayersStats?: WYRPlayerStats[];
  onPlayAgain: () => void;
  onClose: () => void;
}

export function WYRSummary({
  playerStats,
  allPlayersStats,
  onPlayAgain,
  onClose,
}: WYRSummaryProps) {
  const [isSharing, setIsSharing] = useState(false);
  const summaryCardRef = useRef<HTMLDivElement>(null);

  const insights = generateInsights(playerStats);
  const funFacts = generateFunFacts(playerStats, allPlayersStats);
  const personalityType = getPersonalityType(playerStats);

  const handleShare = async () => {
    if (!summaryCardRef.current || isSharing) return;

    setIsSharing(true);
    try {
      const canvas = await html2canvas(summaryCardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
      });

      const imageUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(imageUrl)).blob();

      // Try Web Share API first
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'wyr-results.png', { type: 'image/png' });
        const shareData = { files: [file], title: 'My Would You Rather Results!' };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: download
      const link = document.createElement('a');
      link.download = `wyr-results-${Date.now()}.png`;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface hover:bg-surface-elevated transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Summary Card (this gets captured for sharing) */}
          <div
            ref={summaryCardRef}
            className="bg-gradient-to-b from-surface via-background to-background rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 text-center bg-gradient-to-r from-purple/20 via-gold/20 to-cyan/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-5xl mb-2"
              >
                {personalityType.emoji}
              </motion.div>
              <h2 className="text-2xl font-bold text-gold mb-1">
                {personalityType.name}
              </h2>
              <p className="text-sm text-text-secondary">
                {personalityType.description}
              </p>
            </div>

            {/* Player Info */}
            <div className="px-6 py-4 flex items-center gap-3 border-b border-border/50">
              <PlayerAvatar
                emoji={playerStats.avatarEmoji}
                color={playerStats.avatarColor}
                size="lg"
              />
              <div>
                <h3 className="font-bold text-lg">{playerStats.playerName}</h3>
                <p className="text-sm text-text-muted">
                  {playerStats.totalQuestions} questions answered
                </p>
              </div>
            </div>

            {/* Personality Insights */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-gold" />
                <h4 className="font-semibold">Your Personality Traits</h4>
              </div>

              {insights.map((insight, index) => (
                <InsightBar key={index} insight={insight} delay={index * 0.1} />
              ))}

              {insights.length === 0 && (
                <p className="text-text-muted text-center py-4">
                  Play more to unlock personality insights!
                </p>
              )}
            </div>

            {/* Fun Facts */}
            {funFacts.length > 0 && (
              <div className="px-6 pb-6">
                <h4 className="font-semibold mb-3 text-purple-light">Fun Facts</h4>
                <ul className="space-y-2">
                  {funFacts.map((fact, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <span className="text-gold">•</span>
                      {fact}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats Grid */}
            <div className="px-6 pb-6 grid grid-cols-3 gap-3">
              <StatBox
                emoji="🎲"
                value={playerStats.riskyChoices}
                label="Risky"
                color="text-orange-400"
              />
              <StatBox
                emoji="🎉"
                value={playerStats.funnyChoices}
                label="Funny"
                color="text-yellow-400"
              />
              <StatBox
                emoji="🤔"
                value={playerStats.deepChoices}
                label="Deep"
                color="text-indigo-400"
              />
            </div>

            {/* Watermark */}
            <div className="px-6 pb-4 text-center">
              <p className="text-xs text-text-muted opacity-50">
                New Year Countdown 2026 - Would You Rather
              </p>
            </div>
          </div>

          {/* Action Buttons (outside the captured area) */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="secondary"
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1"
            >
              {isSharing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw size={18} />
                </motion.div>
              ) : (
                <>
                  <Share2 size={18} className="mr-2" />
                  Share
                </>
              )}
            </Button>
            <Button variant="primary" onClick={onPlayAgain} className="flex-1">
              <RefreshCw size={18} className="mr-2" />
              Play Again
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Insight progress bar component
function InsightBar({ insight, delay }: { insight: PersonalityInsight; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface-elevated rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{insight.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold" style={{ color: insight.color }}>
            {insight.title}
          </p>
          <p className="text-xs text-text-muted">{insight.description}</p>
        </div>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${insight.percentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: insight.color }}
        />
      </div>
    </motion.div>
  );
}

// Stat box component
function StatBox({
  emoji,
  value,
  label,
  color,
}: {
  emoji: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.6 }}
      className="bg-surface-elevated rounded-xl p-3 text-center"
    >
      <span className="text-xl">{emoji}</span>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </motion.div>
  );
}
