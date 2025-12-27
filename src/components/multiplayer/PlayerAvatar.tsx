import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface PlayerAvatarProps {
  emoji: string;
  color: string;
  name?: string;
  isHost?: boolean;
  isConnected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-14 h-14 text-2xl',
};

const crownSizes = {
  sm: 10,
  md: 12,
  lg: 16,
};

export function PlayerAvatar({
  emoji,
  color,
  name,
  isHost = false,
  isConnected = true,
  size = 'md',
  showName = false,
  className = '',
}: PlayerAvatarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Avatar circle */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`
            ${sizeClasses[size]}
            rounded-full flex items-center justify-center
            transition-opacity
            ${!isConnected ? 'opacity-50' : ''}
          `}
          style={{ backgroundColor: color }}
        >
          <span>{emoji}</span>
        </motion.div>

        {/* Host crown */}
        {isHost && (
          <motion.div
            initial={{ scale: 0, y: 5 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute -top-1 -right-1 bg-gold rounded-full p-0.5"
          >
            <Crown size={crownSizes[size]} className="text-background" />
          </motion.div>
        )}

        {/* Connection status dot */}
        <div
          className={`
            absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface
            ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}
          `}
        />
      </div>

      {/* Player name */}
      {showName && name && (
        <span
          className={`
            font-medium truncate max-w-[100px]
            ${!isConnected ? 'text-text-muted' : 'text-text-primary'}
          `}
        >
          {name}
        </span>
      )}
    </div>
  );
}
