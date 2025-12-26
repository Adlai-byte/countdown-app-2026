import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TabBar } from '@/components/layout/TabBar';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { MusicToggle } from '@/components/music/MusicToggle';
import { ConfettiCannon } from '@/components/celebration/ConfettiCannon';
import { OnboardingProvider } from '@/components/onboarding/OnboardingTour';
import { AnnouncerProvider } from '@/components/accessibility/ScreenReaderAnnouncer';
import { SkipLink } from '@/components/accessibility/SkipLink';
import { KeyboardShortcutsModal } from '@/components/ui';
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { useConfetti } from '@/hooks/useConfetti';
import { HomePage } from '@/pages/HomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PhotoBoothPage } from '@/pages/PhotoBoothPage';
import { MemesPage } from '@/pages/MemesPage';
import { FunPage } from '@/pages/FunPage';
import { GuestBookPage } from '@/pages/GuestBookPage';
import { ResolutionsPage } from '@/pages/ResolutionsPage';
import { CelebrationPage } from '@/pages/CelebrationPage';
import { FireworksPage } from '@/pages/FireworksPage';

function AppShortcuts({ onShowShortcuts }: { onShowShortcuts: () => void }) {
  const navigate = useNavigate();
  const { fireConfetti } = useConfetti();

  useKeyboardShortcuts([
    { ...GLOBAL_SHORTCUTS.NAVIGATE_HOME, action: () => navigate('/') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_PHOTO, action: () => navigate('/photo-booth') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_MEMES, action: () => navigate('/memes') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_FUN, action: () => navigate('/fun') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_GUEST, action: () => navigate('/guestbook') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_GOALS, action: () => navigate('/resolutions') },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_SETTINGS, action: () => navigate('/settings') },
    { ...GLOBAL_SHORTCUTS.SHOW_SHORTCUTS, action: onShowShortcuts },
    { ...GLOBAL_SHORTCUTS.TOGGLE_CONFETTI, action: fireConfetti },
  ]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleShowShortcuts = useCallback(() => setShowShortcuts(true), []);
  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), []);

  // Close shortcuts modal on Escape
  useKeyboardShortcuts([
    { ...GLOBAL_SHORTCUTS.ESCAPE, action: handleCloseShortcuts, enabled: showShortcuts },
  ]);

  return (
    <>
      <AppShortcuts onShowShortcuts={handleShowShortcuts} />

      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/photo-booth" element={<PhotoBoothPage />} />
              <Route path="/memes" element={<MemesPage />} />
              <Route path="/fun" element={<FunPage />} />
              <Route path="/guestbook" element={<GuestBookPage />} />
              <Route path="/resolutions" element={<ResolutionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/celebration" element={<CelebrationPage />} />
              <Route path="/fireworks" element={<FireworksPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <TabBar />
      <MusicToggle />
      <ConfettiCannon size="md" variant="floating" />

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={handleCloseShortcuts} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnnouncerProvider>
        <OnboardingProvider>
          <div className="min-h-screen flex flex-col relative">
            <SkipLink />
            <ParticleBackground />
            <AnimatedRoutes />
          </div>
        </OnboardingProvider>
      </AnnouncerProvider>
    </BrowserRouter>
  );
}

export default App;
