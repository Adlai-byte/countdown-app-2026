import { motion } from 'framer-motion';
import { Timer, Camera, Image, Gamepad2, Settings, BookOpen, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TabItem {
  path: string;
  icon: React.ElementType;
  label: string;
  tourId?: string;
}

const tabs: TabItem[] = [
  { path: '/', icon: Timer, label: 'Countdown', tourId: 'countdown' },
  { path: '/photo-booth', icon: Camera, label: 'Photo', tourId: 'photo' },
  { path: '/memes', icon: Image, label: 'Memes' },
  { path: '/fun', icon: Gamepad2, label: 'Fun', tourId: 'fun' },
  { path: '/guestbook', icon: BookOpen, label: 'Guest', tourId: 'guest' },
  { path: '/resolutions', icon: Target, label: 'Goals', tourId: 'goals' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="glass border-t border-white/10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center gap-0.5 py-2 px-2 sm:px-3 rounded-xl"
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Navigate to ${tab.label}`}
                  aria-current={isActive ? 'page' : undefined}
                  data-tour={tab.tourId}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-magenta/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={20}
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-gold' : 'text-text-muted'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10px] font-medium transition-colors duration-200 ${
                      isActive ? 'text-gold' : 'text-text-muted'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
