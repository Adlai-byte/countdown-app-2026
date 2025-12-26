import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  return (
    <motion.div
      className={`bg-surface-elevated ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      animate={animate ? { opacity: [0.5, 0.8, 0.5] } : undefined}
      transition={animate ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    />
  );
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-2xl bg-surface-elevated/50 ${className}`}>
      <Skeleton height={120} className="mb-4" rounded="xl" />
      <Skeleton height={20} width="70%" className="mb-2" rounded="sm" />
      <Skeleton height={16} width="50%" rounded="sm" />
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} rounded="full" />;
}

export function SkeletonButton({ width = 100, height = 40 }: { width?: number; height?: number }) {
  return <Skeleton width={width} height={height} rounded="lg" />;
}

export function SkeletonImage({ aspectRatio = '16/9', className = '' }: { aspectRatio?: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ aspectRatio }}>
      <Skeleton className="absolute inset-0" rounded="xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-border/50 flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/30">
          <SkeletonAvatar size={40} />
          <div className="flex-1">
            <Skeleton height={16} width="60%" className="mb-2" rounded="sm" />
            <Skeleton height={12} width="40%" rounded="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ items = 6, columns = 3, className = '' }: { items?: number; columns?: number; className?: string }) {
  return (
    <div className={`grid gap-3 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Page-specific skeletons
export function PhotoBoothSkeleton() {
  return (
    <div className="space-y-4">
      {/* Mode selector skeleton */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={80} height={70} rounded="xl" />
        ))}
      </div>
      {/* Camera area skeleton */}
      <SkeletonImage aspectRatio="3/4" />
      {/* Capture button skeleton */}
      <div className="flex justify-center">
        <Skeleton width={80} height={80} rounded="full" />
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-elevated">
      <Skeleton width={48} height={48} rounded="xl" className="mb-2" />
      <Skeleton width={60} height={14} rounded="sm" />
    </div>
  );
}

export function CountdownSkeleton() {
  return (
    <div className="text-center space-y-6">
      <Skeleton width={200} height={32} rounded="lg" className="mx-auto" />
      <div className="flex justify-center gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton width={70} height={70} rounded="xl" className="mb-2" />
            <Skeleton width={50} height={14} rounded="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
