import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function Logo({ size = 'md', animated = false, className = '' }: LogoProps) {
  const dimension = sizeMap[size];

  const logoSvg = (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      className={className}
    >
      <defs>
        <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Outer ring - representing time cycle */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="url(#mainGrad)"
        strokeWidth="3"
        opacity="0.9"
      />

      {/* Middle ring - subtle */}
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="url(#mainGrad)"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Diamond/hourglass shape - countdown motif */}
      <path
        d="M50 12 L72 50 L50 88 L28 50 Z"
        fill="none"
        stroke="url(#mainGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Inner diamond fill - celebration energy */}
      <path d="M50 25 L62 50 L50 75 L38 50 Z" fill="url(#innerGrad)" opacity="0.85" />

      {/* Center dot - focal point */}
      <circle cx="50" cy="50" r="6" fill="#ffd700" />

      {/* Accent sparkle dots */}
      <circle cx="50" cy="8" r="2" fill="#ffd700" opacity="0.8" />
      <circle cx="50" cy="92" r="2" fill="#9333ea" opacity="0.8" />
      <circle cx="8" cy="50" r="2" fill="#ec4899" opacity="0.8" />
      <circle cx="92" cy="50" r="2" fill="#ec4899" opacity="0.8" />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {logoSvg}
      </motion.div>
    );
  }

  return logoSvg;
}
