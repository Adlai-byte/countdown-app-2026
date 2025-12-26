import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-surface border border-border',
  glass: 'glass',
  gradient:
    'bg-gradient-to-br from-purple-500/10 via-magenta/10 to-gold/10 border border-white/10',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'cursor-pointer transition-shadow hover:shadow-lg hover:shadow-purple-500/10' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
