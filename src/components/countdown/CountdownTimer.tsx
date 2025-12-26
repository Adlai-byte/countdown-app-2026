import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { FlipCard } from './FlipCard';
import { NewYearCelebration } from './NewYearCelebration';
import { CountdownWidget } from './CountdownWidget';

export function CountdownTimer() {
  const { days, hours, minutes, seconds, isNewYear } = useCountdown();
  const targetYear = new Date().getFullYear() + 1;

  if (isNewYear) {
    return <NewYearCelebration year={targetYear} />;
  }

  return (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Countdown to{' '}
          <span className="gradient-text">{targetYear}</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          New Year is approaching!
        </p>
      </motion.div>

      {/* Countdown Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 sm:gap-4 md:gap-6"
      >
        <FlipCard value={days} label="Days" />
        <Separator />
        <FlipCard value={hours} label="Hours" />
        <Separator />
        <FlipCard value={minutes} label="Minutes" />
        <Separator />
        <FlipCard value={seconds} label="Seconds" />
      </motion.div>

      {/* Message based on remaining time */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        {days === 0 && hours < 1 ? (
          <p className="text-gold text-lg font-medium animate-pulse">
            Almost there! Get ready to celebrate!
          </p>
        ) : days < 7 ? (
          <p className="text-magenta text-base">
            Just {days} days left! Have you set your resolutions?
          </p>
        ) : (
          <p className="text-text-muted text-sm">
            Make every moment count
          </p>
        )}
      </motion.div>

      {/* Share Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex justify-center"
      >
        <CountdownWidget
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />
      </motion.div>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-3">
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-gold"
      />
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-gold"
      />
    </div>
  );
}
