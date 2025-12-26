import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Save, RotateCcw, Sparkles, Image } from 'lucide-react';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';
import type { FilterType, FrameType } from '@/stores/photoBoothStore';
import { Button, Card } from '@/components/ui';

interface PhotoEditorProps {
  photoUrl: string;
  onSave: () => void;
  onDownload: () => void;
  onRetake: () => void;
}

const FILTERS: { id: FilterType; name: string; style: string }[] = [
  { id: 'none', name: 'None', style: '' },
  { id: 'warm', name: 'Warm', style: 'sepia(0.3) saturate(1.3)' },
  { id: 'cool', name: 'Cool', style: 'saturate(0.9) hue-rotate(10deg)' },
  { id: 'vintage', name: 'Vintage', style: 'sepia(0.5) contrast(1.1)' },
  { id: 'sparkle', name: 'Sparkle', style: 'brightness(1.1) contrast(1.1)' },
];

const FRAMES: { id: FrameType; name: string; emoji: string }[] = [
  { id: 'none', name: 'None', emoji: '' },
  { id: 'confetti', name: 'Confetti', emoji: '' },
  { id: 'fireworks', name: 'Fireworks', emoji: '' },
  { id: 'newyear', name: '2026', emoji: '' },
  { id: 'stars', name: 'Stars', emoji: '' },
];

export function PhotoEditor({ photoUrl, onSave, onDownload, onRetake }: PhotoEditorProps) {
  const { selectedFilter, selectedFrame, setSelectedFilter, setSelectedFrame } = usePhotoBoothStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentFilter = FILTERS.find((f) => f.id === selectedFilter) || FILTERS[0];

  return (
    <div className="space-y-4">
      {/* Photo Preview */}
      <Card padding="none" className="overflow-hidden relative aspect-[3/4]">
        <div className="relative w-full h-full">
          <img
            src={photoUrl}
            alt="Captured"
            className="w-full h-full object-cover"
            style={{ filter: currentFilter.style }}
          />

          {/* Frame Overlays */}
          {selectedFrame !== 'none' && (
            <div className="absolute inset-0 pointer-events-none">
              {selectedFrame === 'confetti' && <ConfettiFrame />}
              {selectedFrame === 'fireworks' && <FireworksFrame />}
              {selectedFrame === 'newyear' && <NewYearFrame />}
              {selectedFrame === 'stars' && <StarsFrame />}
            </div>
          )}
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />
      </Card>

      {/* Filter Selection */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-gold" />
          <span className="font-medium text-text-primary text-sm">Filters</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${selectedFilter === filter.id ? 'border-gold scale-105' : 'border-border'}
              `}
            >
              <img
                src={photoUrl}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.style }}
              />
            </button>
          ))}
        </div>
      </Card>

      {/* Frame Selection */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Image size={18} className="text-purple-light" />
          <span className="font-medium text-text-primary text-sm">Frames</span>
        </div>
        <div className="flex gap-2">
          {FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className={`
                flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all
                ${
                  selectedFrame === frame.id
                    ? 'border-gold bg-gold/20 text-gold'
                    : 'border-border text-text-secondary hover:border-text-muted'
                }
              `}
            >
              {frame.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onRetake} className="flex-1">
          <RotateCcw size={18} className="mr-2" />
          Retake
        </Button>
        <Button variant="secondary" onClick={onDownload} className="flex-1">
          <Download size={18} className="mr-2" />
          Download
        </Button>
        <Button variant="primary" onClick={onSave} className="flex-1">
          <Save size={18} className="mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// Frame Components
function ConfettiFrame() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: '120%',
            opacity: [0, 1, 1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-3 h-3"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#ffd700', '#9333ea', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

function FireworksFrame() {
  return (
    <div className="absolute inset-0">
      {/* Top corners */}
      <div className="absolute top-4 left-4 text-4xl animate-pulse">*</div>
      <div className="absolute top-4 right-4 text-4xl animate-pulse delay-100">*</div>
      {/* Bottom corners */}
      <div className="absolute bottom-4 left-4 text-4xl animate-pulse delay-200">*</div>
      <div className="absolute bottom-4 right-4 text-4xl animate-pulse delay-300">*</div>
      {/* Gradient border effect */}
      <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-gold via-magenta to-purple opacity-50 rounded-lg" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '4px' }} />
    </div>
  );
}

function NewYearFrame() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4">
      {/* Top banner */}
      <div className="text-center">
        <div
          className="text-3xl font-bold gradient-text"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Happy New Year
        </div>
      </div>

      {/* Bottom banner */}
      <div className="text-center">
        <div
          className="text-6xl font-bold text-gold"
          style={{
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          }}
        >
          2026
        </div>
      </div>
    </div>
  );
}

function StarsFrame() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute text-gold"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${12 + Math.random() * 16}px`,
          }}
        >
          *
        </motion.div>
      ))}
    </div>
  );
}
