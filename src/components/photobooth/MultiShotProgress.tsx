import { motion } from 'framer-motion';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';

export function MultiShotProgress() {
  const { currentSession } = usePhotoBoothStore();

  if (!currentSession || currentSession.mode === 'single') {
    return null;
  }

  const { currentShot, totalShots, shots, mode } = currentSession;
  const progress = (currentShot / totalShots) * 100;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple to-magenta"
          />
        </div>
        <span className="text-sm font-medium text-text-primary">
          {currentShot} / {totalShots}
        </span>
      </div>

      {/* Thumbnails */}
      {shots.length > 0 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalShots }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: shots[index] ? 1 : 0.8,
                opacity: shots[index] ? 1 : 0.3,
              }}
              className={`
                w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors
                ${shots[index] ? 'border-purple' : 'border-border'}
                ${index === currentShot ? 'ring-2 ring-gold' : ''}
              `}
            >
              {shots[index] ? (
                <img
                  src={shots[index]}
                  alt={`Shot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                  <span className="text-xs text-text-muted">{index + 1}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Mode indicator */}
      <div className="text-center text-sm text-text-muted">
        {mode === 'strip' && 'Photo Strip Mode - 4 photos stacked vertically'}
        {mode === 'collage' && 'Collage Mode - 2×2 photo grid'}
        {mode === 'gif' && 'GIF Mode - 8 frames animated'}
      </div>
    </div>
  );
}
