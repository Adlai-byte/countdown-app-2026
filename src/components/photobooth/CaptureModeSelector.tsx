import { motion } from 'framer-motion';
import { Camera, LayoutGrid, Rows3, Film } from 'lucide-react';
import { usePhotoBoothStore, type CaptureMode } from '@/stores/photoBoothStore';

const modes: { id: CaptureMode; icon: React.ElementType; label: string; description: string }[] = [
  { id: 'single', icon: Camera, label: 'Single', description: '1 photo' },
  { id: 'strip', icon: Rows3, label: 'Strip', description: '4 vertical' },
  { id: 'collage', icon: LayoutGrid, label: 'Collage', description: '2×2 grid' },
  { id: 'gif', icon: Film, label: 'Filmstrip', description: '8 frames' },
];

export function CaptureModeSelector() {
  const { captureMode, setCaptureMode, currentSession } = usePhotoBoothStore();

  // Disable mode changes during an active session
  const isDisabled = currentSession?.isCapturing;

  return (
    <div className="flex gap-2 justify-center">
      {modes.map((mode) => {
        const isActive = captureMode === mode.id;
        const Icon = mode.icon;

        return (
          <motion.button
            key={mode.id}
            whileHover={!isDisabled ? { scale: 1.05 } : undefined}
            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
            onClick={() => !isDisabled && setCaptureMode(mode.id)}
            disabled={isDisabled}
            className={`
              flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all
              ${isActive
                ? 'bg-gradient-to-br from-purple to-magenta text-white'
                : isDisabled
                  ? 'bg-surface-elevated/50 text-text-muted cursor-not-allowed'
                  : 'bg-surface-elevated hover:bg-border/30 text-text-secondary'
              }
            `}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{mode.label}</span>
            <span className="text-[10px] opacity-70">{mode.description}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
