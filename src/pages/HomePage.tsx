import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown/CountdownTimer';
import { TimeZoneParty } from '@/components/countdown/TimeZoneParty';

export function HomePage() {
  const [showWorldCountdown, setShowWorldCountdown] = useState(false);

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto">
      {/* Main Countdown */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <CountdownTimer />
      </div>

      {/* World Countdown Section */}
      <div className="max-w-md mx-auto w-full px-4 pb-4">
        {/* Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowWorldCountdown(!showWorldCountdown)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-elevated hover:bg-border/30 transition-colors mb-4"
        >
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-purple" />
            <div className="text-left">
              <p className="font-medium text-text-primary">World Countdown</p>
              <p className="text-sm text-text-muted">Watch New Year travel the globe</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showWorldCountdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-text-muted" />
          </motion.div>
        </motion.button>

        {/* World Countdown Content */}
        <AnimatePresence>
          {showWorldCountdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <TimeZoneParty />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
