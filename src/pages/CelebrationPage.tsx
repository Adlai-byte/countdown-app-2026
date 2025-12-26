import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { NoiseMaker } from '@/components/celebration/NoiseMaker';
import { ConfettiCannon } from '@/components/celebration/ConfettiCannon';
import { YearInReview } from '@/components/memories/YearInReview';
import { PartyPlaylist } from '@/components/music/PartyPlaylist';
import { ChampagneToast } from '@/components/celebration/ChampagneToast';
import { Card } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

type TabType = 'noisemaker' | 'memories' | 'playlist' | 'toast' | null;

export function CelebrationPage() {
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const navigate = useNavigate();

  const features = [
    {
      id: 'fireworks' as const,
      name: 'Fireworks',
      description: 'Launch your own firework show',
      emoji: '🎆',
      color: 'from-red-500 to-orange-500',
      action: () => navigate('/fireworks'),
    },
    {
      id: 'noisemaker' as const,
      name: 'Noise Maker',
      description: 'Party sounds at your fingertips',
      emoji: '📯',
      color: 'from-yellow-500 to-orange-500',
      action: () => setActiveTab('noisemaker'),
    },
    {
      id: 'memories' as const,
      name: '2024 Memories',
      description: 'Your year in review',
      emoji: '📸',
      color: 'from-purple to-magenta',
      action: () => setActiveTab('memories'),
    },
    {
      id: 'playlist' as const,
      name: 'Party Queue',
      description: 'Vote for next song',
      emoji: '🎵',
      color: 'from-cyan to-blue-500',
      action: () => setActiveTab('playlist'),
    },
    {
      id: 'toast' as const,
      name: 'Virtual Toast',
      description: 'Cheers together!',
      emoji: '🥂',
      color: 'from-gold to-amber-500',
      action: () => setActiveTab('toast'),
    },
  ];

  return (
    <div className="flex-1 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back Button */}
              <button
                onClick={() => setActiveTab(null)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
              >
                <ChevronLeft size={20} />
                <span>Back to Celebration</span>
              </button>

              {activeTab === 'noisemaker' && <NoiseMaker />}
              {activeTab === 'memories' && <YearInReview />}
              {activeTab === 'playlist' && <PartyPlaylist />}
              {activeTab === 'toast' && <ChampagneToast />}
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
              >
                <h1
                  className="text-2xl font-bold text-text-primary"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Celebration Zone
                </h1>
                <p className="text-text-secondary">
                  Make some noise and celebrate!
                </p>
              </motion.div>

              {/* Confetti Cannon - Featured */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <Card variant="glass" className="p-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <ConfettiCannon size="lg" />
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">Confetti Cannon</h3>
                      <p className="text-sm text-text-secondary">Tap to celebrate!</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Feature Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                {features.map((feature) => (
                  <motion.button
                    key={feature.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={feature.action}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl
                      bg-gradient-to-r ${feature.color}
                      text-white shadow-lg
                    `}
                  >
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                      {feature.emoji}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">{feature.name}</h3>
                      <p className="text-sm text-white/80">{feature.description}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {/* Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Card variant="glass" className="p-4 text-center">
                  <p className="text-sm text-text-muted">
                    Pro tip: Use the Confetti Cannon at midnight!
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Confetti Cannon (always visible) */}
      {!activeTab && <ConfettiCannon size="md" variant="floating" />}
    </div>
  );
}
