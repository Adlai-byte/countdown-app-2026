import { motion } from 'framer-motion';
import { Volume2, VolumeX, Palette, User, Music, Music2, Keyboard, Sparkles } from 'lucide-react';
import { Input, Card, Button } from '@/components/ui';
import { useSettingsStore } from '@/stores/settingsStore';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { PartyStats } from '@/components/widgets/PartyStats';
import { PartyQRCode } from '@/components/widgets/PartyQRCode';
import { MidnightAlarm } from '@/components/widgets/MidnightAlarm';
import { useOnboarding } from '@/components/onboarding/OnboardingTour';
import type { ThemeColor } from '@/types';

export function SettingsPage() {
  const {
    userName,
    setUserName,
    themeColor,
    setThemeColor,
    soundEnabled,
    toggleSound,
    musicEnabled,
    toggleMusic,
  } = useSettingsStore();
  const { startTour } = useOnboarding();

  const themeColors: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'gold', name: 'Gold', color: '#ffd700' },
    { id: 'purple', name: 'Purple', color: '#9333ea' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
    { id: 'magenta', name: 'Magenta', color: '#ec4899' },
    { id: 'green', name: 'Green', color: '#22c55e' },
  ];

  return (
    <div className="flex-1 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Settings
          </h1>
          <p className="text-text-secondary">
            Customize your experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
                  <User size={20} className="text-purple-light" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Your Name</h3>
                  <p className="text-sm text-text-muted">
                    Shown in your Year Wrap
                  </p>
                </div>
              </div>
              <Input
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Card>
          </motion.div>

          {/* Theme Color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-magenta/20 flex items-center justify-center">
                  <Palette size={20} className="text-magenta" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Theme Color</h3>
                  <p className="text-sm text-text-muted">
                    Choose your accent color
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {themeColors.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setThemeColor(color.id)}
                    className={`
                      w-10 h-10 rounded-full transition-all
                      ${
                        themeColor === color.id
                          ? 'ring-2 ring-offset-2 ring-offset-surface ring-white'
                          : ''
                      }
                    `}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Sound */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                    {soundEnabled ? (
                      <Volume2 size={20} className="text-cyan" />
                    ) : (
                      <VolumeX size={20} className="text-text-muted" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">Sound Effects</h3>
                    <p className="text-sm text-text-muted">
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSound}
                  className={`
                    w-14 h-8 rounded-full p-1 transition-colors
                    ${soundEnabled ? 'bg-cyan' : 'bg-surface-elevated'}
                  `}
                >
                  <motion.div
                    animate={{ x: soundEnabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Music */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
                    {musicEnabled ? (
                      <Music2 size={20} className="text-purple-light" />
                    ) : (
                      <Music size={20} className="text-text-muted" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">Background Music</h3>
                    <p className="text-sm text-text-muted">
                      {musicEnabled ? 'Playing' : 'Tap music button to play'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMusic}
                  className={`
                    w-14 h-8 rounded-full p-1 transition-colors
                    ${musicEnabled ? 'bg-purple' : 'bg-surface-elevated'}
                  `}
                >
                  <motion.div
                    animate={{ x: musicEnabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Widgets Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">Party Widgets</h2>
          </motion.div>

          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <WeatherWidget />
          </motion.div>

          {/* Midnight Alarm */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MidnightAlarm />
          </motion.div>

          {/* Party Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <PartyStats />
          </motion.div>

          {/* Party QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <PartyQRCode />
          </motion.div>

          {/* Help & Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="pt-4"
          >
            <h2 className="text-lg font-bold text-text-primary mb-4">Help & Tips</h2>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Keyboard size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Keyboard Shortcuts</h3>
                  <p className="text-sm text-text-muted">Navigate faster with keys</p>
                </div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Show shortcuts</span>
                  <kbd className="px-2 py-0.5 rounded bg-border/50 text-text-primary font-mono text-xs">Shift + ?</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Navigate tabs</span>
                  <kbd className="px-2 py-0.5 rounded bg-border/50 text-text-primary font-mono text-xs">1-7</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Launch confetti</span>
                  <kbd className="px-2 py-0.5 rounded bg-border/50 text-text-primary font-mono text-xs">C</kbd>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Restart Tour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-purple-light" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">App Tour</h3>
                  <p className="text-sm text-text-muted">Learn about all features</p>
                </div>
              </div>
              <Button variant="secondary" onClick={startTour} className="w-full">
                <Sparkles size={16} className="mr-2" />
                Restart Tour
              </Button>
            </Card>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card variant="glass" className="text-center">
              <h3 className="font-medium text-text-primary mb-1">
                New Year Countdown
              </h3>
              <p className="text-sm text-text-muted mb-2">Version 2.0.0</p>
              <p className="text-xs text-text-muted">
                The ultimate NYE party app!
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
