import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Share2, Copy, Check, Star } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { fetchRandomAdvice, fetchYearFact, fetchRandomQuote } from '@/services/partyApi';
import { useConfetti } from '@/hooks/useConfetti';

interface Fortune {
  advice: string;
  yearFact: string;
  quote: { content: string; author: string };
  luckyNumber: number;
  luckyColor: string;
  prediction: string;
}

const COLORS = [
  { name: 'Gold', emoji: '💛', hex: '#ffd700' },
  { name: 'Purple', emoji: '💜', hex: '#9333ea' },
  { name: 'Cyan', emoji: '💙', hex: '#06b6d4' },
  { name: 'Green', emoji: '💚', hex: '#22c55e' },
  { name: 'Pink', emoji: '💗', hex: '#ec4899' },
  { name: 'Orange', emoji: '🧡', hex: '#f97316' },
];

const PREDICTIONS = [
  "2026 will bring unexpected adventures and new friendships!",
  "A creative breakthrough awaits you in the first quarter!",
  "Your hard work will finally pay off this year!",
  "Love and laughter will fill your home in 2026!",
  "A surprise opportunity will change your perspective!",
  "This year, you'll discover a hidden talent!",
  "2026 is your year to shine - embrace the spotlight!",
  "Financial stability is written in your stars!",
  "A long-held dream will finally come true!",
  "New connections will open unexpected doors!",
  "Your intuition will guide you to success!",
  "Adventure calls - say yes to new experiences!",
];

export function FortuneTeller() {
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealStage, setRevealStage] = useState(0);
  const { fireCelebration } = useConfetti();

  const generateFortune = async () => {
    setLoading(true);
    setRevealStage(0);

    try {
      // Fetch from multiple APIs in parallel
      const [advice, yearFact, quote] = await Promise.all([
        fetchRandomAdvice().catch(() => "Trust your instincts and embrace change."),
        fetchYearFact(2026).catch(() => "2026 is the Year of the Horse in the Chinese zodiac."),
        fetchRandomQuote().catch(() => ({
          content: "The best time to plant a tree was 20 years ago. The second best time is now.",
          author: "Chinese Proverb",
        })),
      ]);

      const luckyNumber = Math.floor(Math.random() * 100) + 1;
      const luckyColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const prediction = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];

      setFortune({
        advice: typeof advice === 'string' ? advice : "Trust your instincts.",
        yearFact: typeof yearFact === 'string' ? yearFact : "2026 awaits!",
        quote: {
          content: typeof quote === 'object' && quote.content ? quote.content : "The future belongs to those who believe.",
          author: typeof quote === 'object' && quote.author ? quote.author : "Unknown",
        },
        luckyNumber,
        luckyColor: luckyColor.name,
        prediction,
      });

      // Start reveal animation
      setRevealStage(1);
      setTimeout(() => setRevealStage(2), 1500);
      setTimeout(() => setRevealStage(3), 3000);
      setTimeout(() => {
        setRevealStage(4);
        fireCelebration();
      }, 4500);
    } catch {
      // Fallback fortune
      setFortune({
        advice: "Trust your instincts and embrace change.",
        yearFact: "2026 is the Year of the Horse.",
        quote: { content: "The future belongs to those who believe.", author: "Unknown" },
        luckyNumber: 7,
        luckyColor: "Gold",
        prediction: "2026 will bring unexpected adventures!",
      });
      setRevealStage(4);
    } finally {
      setLoading(false);
    }
  };

  const copyFortune = async () => {
    if (!fortune) return;
    const text = `🔮 My 2026 Fortune 🔮\n\n✨ ${fortune.prediction}\n\n💡 Advice: ${fortune.advice}\n\n📖 "${fortune.quote.content}" - ${fortune.quote.author}\n\n🍀 Lucky Number: ${fortune.luckyNumber}\n🎨 Lucky Color: ${fortune.luckyColor}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFortune = async () => {
    if (!fortune) return;
    const text = `🔮 My 2026 Fortune: ${fortune.prediction}\n\n💡 ${fortune.advice}\n\n🍀 Lucky #${fortune.luckyNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My 2026 Fortune', text });
      } catch {
        copyFortune();
      }
    } else {
      copyFortune();
    }
  };

  const luckyColorData = COLORS.find((c) => c.name === fortune?.luckyColor) || COLORS[0];

  return (
    <div className="space-y-4">
      {/* Fortune Display */}
      <Card variant="glass" className="p-6 min-h-[300px] relative overflow-hidden">
        {/* Mystical Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-transparent to-magenta/10" />

        <AnimatePresence mode="wait">
          {!fortune && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-4"
              >
                🔮
              </motion.div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                2026 Fortune Teller
              </h3>
              <p className="text-text-secondary">
                Discover what the new year holds for you!
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center relative z-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl inline-block"
              >
                ✨
              </motion.div>
              <p className="text-text-secondary mt-4">
                Consulting the stars...
              </p>
            </motion.div>
          ) : fortune && (
            <motion.div
              key="fortune"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 relative z-10"
            >
              {/* Prediction - Stage 1 */}
              <AnimatePresence>
                {revealStage >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Star className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-lg font-bold text-gold">
                      {fortune.prediction}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advice - Stage 2 */}
              <AnimatePresence>
                {revealStage >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-elevated/50 rounded-xl p-4"
                  >
                    <p className="text-sm text-text-muted mb-1">💡 Advice for 2026</p>
                    <p className="text-text-primary">{fortune.advice}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quote - Stage 3 */}
              <AnimatePresence>
                {revealStage >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center italic"
                  >
                    <p className="text-text-secondary">
                      "{fortune.quote.content}"
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      — {fortune.quote.author}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lucky Numbers - Stage 4 */}
              <AnimatePresence>
                {revealStage >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center gap-6 pt-4"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center text-black font-bold text-lg mx-auto mb-1">
                        {fortune.luckyNumber}
                      </div>
                      <p className="text-xs text-text-muted">Lucky #</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-1"
                        style={{ backgroundColor: luckyColorData.hex + '30' }}
                      >
                        {luckyColorData.emoji}
                      </div>
                      <p className="text-xs text-text-muted">{fortune.luckyColor}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Year Fact */}
      {fortune && revealStage >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" className="p-4">
            <p className="text-sm text-text-muted mb-1">📅 Did you know?</p>
            <p className="text-sm text-text-secondary">{fortune.yearFact}</p>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={generateFortune}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <RefreshCw size={18} className="mr-2 animate-spin" />
          ) : (
            <Sparkles size={18} className="mr-2" />
          )}
          {fortune ? 'New Fortune' : 'Reveal My Fortune'}
        </Button>

        {fortune && revealStage >= 4 && (
          <>
            <Button variant="secondary" onClick={shareFortune}>
              <Share2 size={18} />
            </Button>
            <Button variant="secondary" onClick={copyFortune}>
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </Button>
          </>
        )}
      </div>

      {/* API Credit */}
      <Card variant="glass" className="p-3 text-center">
        <p className="text-xs text-text-muted">
          Powered by Advice Slip, Numbers API & Quotable
        </p>
      </Card>
    </div>
  );
}
