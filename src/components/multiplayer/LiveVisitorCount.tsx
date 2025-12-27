import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye } from 'lucide-react';
import { useVisitorCount } from '@/hooks/multiplayer';

interface LiveVisitorCountProps {
  variant?: 'default' | 'compact' | 'badge';
  className?: string;
}

export function LiveVisitorCount({ variant = 'default', className = '' }: LiveVisitorCountProps) {
  const visitorCount = useVisitorCount();

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-green-500/20 text-green-400 text-xs font-medium
          ${className}
        `}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={visitorCount}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {visitorCount}
          </motion.span>
        </AnimatePresence>
        <span>online</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 text-text-secondary text-sm ${className}`}>
        <Eye size={14} className="text-green-500" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={visitorCount}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 5, opacity: 0 }}
            className="font-medium"
          >
            {visitorCount}
          </motion.span>
        </AnimatePresence>
        <span>viewing</span>
      </div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center gap-3 px-4 py-2 rounded-xl
        bg-surface-elevated border border-border/50
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Users size={18} className="text-green-500" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={visitorCount}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="font-bold text-text-primary"
            >
              {visitorCount}
            </motion.span>
          </AnimatePresence>
          <span className="text-text-secondary text-sm">
            {visitorCount === 1 ? 'person' : 'people'} celebrating
          </span>
        </div>
      </div>
    </motion.div>
  );
}
