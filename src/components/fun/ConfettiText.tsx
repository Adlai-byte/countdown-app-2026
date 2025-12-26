import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Sparkles, RotateCcw, Share2, Download } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';
import { toPng } from 'html-to-image';

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6',
  '#e91e63', '#00bcd4', '#ff9800', '#8bc34a', '#673ab7',
  '#ffd700', '#ec4899',
];

const PRESETS = [
  "Happy New Year!",
  "2026",
  "Cheers!",
  "Let's Party!",
  "YOLO",
  "Best Year Ever",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

export function ConfettiText() {
  const [text, setText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffd700');
  const containerRef = useRef<HTMLDivElement>(null);
  const { fireCelebration } = useConfetti();

  const generateParticles = () => {
    const newParticles: Particle[] = [];
    const numParticles = 50;

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 20,
        velocityY: Math.random() * -15 - 5,
      });
    }

    setParticles(newParticles);
    setShowConfetti(true);
    fireCelebration();

    // Clear after animation
    setTimeout(() => {
      setShowConfetti(false);
      setParticles([]);
    }, 3000);
  };

  const explodeText = () => {
    if (!text.trim()) return;
    generateParticles();
  };

  const downloadImage = async () => {
    if (!containerRef.current) return;

    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = 'confetti-text.png';
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback
    }
  };

  const shareImage = async () => {
    if (!containerRef.current) return;

    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: '#0a0a0f',
        pixelRatio: 2,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'confetti-text.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Confetti Text',
          text: text,
        });
      } else {
        downloadImage();
      }
    } catch {
      downloadImage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Type size={18} className="text-gold" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder-text-muted"
            maxLength={30}
          />
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setText(preset)}
              className="px-3 py-1 text-xs rounded-full bg-surface-elevated text-text-secondary hover:bg-border/50 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </Card>

      {/* Preview Area */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        <div
          ref={containerRef}
          className="relative h-64 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' }}
        >
          {/* Confetti Particles */}
          <AnimatePresence>
            {showConfetti && particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: `${particle.x}%`,
                  y: '50%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${particle.x + particle.velocityX * 5}%`,
                  y: `${50 + particle.velocityY * -5 + 100}%`,
                  scale: [0, 1, 1, 0],
                  rotate: particle.rotation * 3,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Text Display */}
          <motion.h2
            key={text}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: showConfetti ? [1, 1.2, 1] : 1,
              opacity: 1,
            }}
            className="text-center font-bold px-4"
            style={{
              fontSize: `${fontSize}px`,
              color: textColor,
              textShadow: `0 0 20px ${textColor}50`,
              fontFamily: 'var(--font-display)',
            }}
          >
            {text || 'Your Text Here'}
          </motion.h2>
        </div>
      </Card>

      {/* Controls */}
      <Card variant="glass" className="p-4">
        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <p className="text-sm text-text-muted mb-2">Font Size: {fontSize}px</p>
            <input
              type="range"
              min={24}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Color Picker */}
          <div>
            <p className="text-sm text-text-muted mb-2">Text Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    textColor === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={explodeText}
          disabled={!text.trim()}
          className="flex-1"
        >
          <Sparkles size={18} className="mr-2" />
          Explode!
        </Button>
        <Button variant="secondary" onClick={shareImage}>
          <Share2 size={18} />
        </Button>
        <Button variant="secondary" onClick={downloadImage}>
          <Download size={18} />
        </Button>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        onClick={() => {
          setText('');
          setFontSize(48);
          setTextColor('#ffd700');
        }}
        className="w-full"
      >
        <RotateCcw size={16} className="mr-2" />
        Reset
      </Button>
    </div>
  );
}
