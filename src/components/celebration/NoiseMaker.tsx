import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui';
import useSound from 'use-sound';

interface SoundButton {
  id: string;
  name: string;
  emoji: string;
  url: string;
  color: string;
}

const SOUNDS: SoundButton[] = [
  {
    id: 'horn',
    name: 'Party Horn',
    emoji: '📯',
    url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'cheer',
    name: 'Crowd Cheer',
    emoji: '🎉',
    url: 'https://assets.mixkit.co/active_storage/sfx/2193/2193-preview.mp3',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'whistle',
    name: 'Whistle',
    emoji: '🎵',
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'champagne',
    name: 'Champagne Pop',
    emoji: '🍾',
    url: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'bell',
    name: 'Bell Ring',
    emoji: '🔔',
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'applause',
    name: 'Applause',
    emoji: '👏',
    url: 'https://assets.mixkit.co/active_storage/sfx/517/517-preview.mp3',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'countdown',
    name: 'Countdown',
    emoji: '⏰',
    url: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'firework',
    name: 'Firework',
    emoji: '🎆',
    url: 'https://assets.mixkit.co/active_storage/sfx/1703/1703-preview.mp3',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'explosion',
    name: 'Boom!',
    emoji: '💥',
    url: 'https://assets.mixkit.co/active_storage/sfx/1684/1684-preview.mp3',
    color: 'from-red-600 to-orange-600',
  },
  {
    id: 'tada',
    name: 'Ta-Da!',
    emoji: '✨',
    url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'drumroll',
    name: 'Drum Roll',
    emoji: '🥁',
    url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
    color: 'from-gray-600 to-gray-800',
  },
  {
    id: 'woohoo',
    name: 'Woo-Hoo!',
    emoji: '🙌',
    url: 'https://assets.mixkit.co/active_storage/sfx/2193/2193-preview.mp3',
    color: 'from-violet-500 to-purple-500',
  },
];

function SoundPad({ sound }: { sound: SoundButton }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [play] = useSound(sound.url, {
    volume: 0.6,
    onplay: () => setIsPlaying(true),
    onend: () => setIsPlaying(false),
  });

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => play()}
      className={`
        relative aspect-square rounded-2xl
        bg-gradient-to-br ${sound.color}
        flex flex-col items-center justify-center gap-1
        shadow-lg transition-shadow
        ${isPlaying ? 'shadow-xl ring-2 ring-white/50' : ''}
      `}
    >
      <motion.span
        animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0 }}
        className="text-3xl"
      >
        {sound.emoji}
      </motion.span>
      <span className="text-xs font-medium text-white/90 px-1 text-center leading-tight">
        {sound.name}
      </span>

      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl border-2 border-white/50"
        />
      )}
    </motion.button>
  );
}

export function NoiseMaker() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Noise Maker</h2>
          <p className="text-sm text-text-secondary">Tap to make some noise!</p>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`
            p-3 rounded-full transition-colors
            ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-surface-elevated text-text-secondary'}
          `}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Sound Grid */}
      <Card variant="glass" className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {SOUNDS.map((sound) => (
            <SoundPad key={sound.id} sound={sound} />
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card variant="glass" className="p-4">
        <p className="text-sm text-text-muted text-center">
          Pro tip: Use with Fireworks for the ultimate celebration!
        </p>
      </Card>
    </div>
  );
}
