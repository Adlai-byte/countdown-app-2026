import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui';
import useSound from 'use-sound';

const FIREWORK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1703/1703-preview.mp3';
const EXPLOSION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2798/2798-preview.mp3';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

const COLORS = [
  '#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff',
  '#0066ff', '#9900ff', '#ff00ff', '#ff69b4', '#ffd700',
];

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animationRef = useRef<number | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playLaunch] = useSound(FIREWORK_SOUND, { volume: 0.3 });
  const [playExplosion] = useSound(EXPLOSION_SOUND, { volume: 0.2 });

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const createParticles = useCallback((x: number, y: number, color: string): Particle[] => {
    const particles: Particle[] = [];
    const particleCount = 80 + Math.random() * 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
      const speed = 2 + Math.random() * 4;
      const life = 60 + Math.random() * 40;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 2,
        trail: [],
      });
    }

    return particles;
  }, []);

  const launchFirework = useCallback((clientX?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX !== undefined
      ? clientX - rect.left
      : rect.width * 0.2 + Math.random() * rect.width * 0.6;
    const targetY = rect.height * 0.1 + Math.random() * rect.height * 0.3;
    const color = getRandomColor();

    fireworksRef.current.push({
      x,
      y: rect.height,
      targetY,
      vy: -12 - Math.random() * 4,
      color,
      exploded: false,
      particles: [],
    });

    playLaunch();
  }, [playLaunch]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworksRef.current = fireworksRef.current.filter((firework) => {
      if (!firework.exploded) {
        // Draw rising firework
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = firework.color;
        ctx.fill();

        // Draw trail
        const gradient = ctx.createLinearGradient(
          firework.x, firework.y,
          firework.x, firework.y + 30
        );
        gradient.addColorStop(0, firework.color);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(firework.x, firework.y);
        ctx.lineTo(firework.x, firework.y + 30);
        ctx.stroke();

        // Update position
        firework.y += firework.vy;
        firework.vy += 0.15; // gravity

        // Check if reached target
        if (firework.y <= firework.targetY || firework.vy >= 0) {
          firework.exploded = true;
          firework.particles = createParticles(firework.x, firework.y, firework.color);
          playExplosion();
        }

        return true;
      } else {
        // Update and draw particles
        firework.particles = firework.particles.filter((particle) => {
          // Store trail
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 5) particle.trail.shift();

          // Draw trail
          if (particle.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            for (let i = 1; i < particle.trail.length; i++) {
              ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            ctx.strokeStyle = `${particle.color}${Math.floor((particle.life / particle.maxLife) * 50).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = particle.size * 0.5;
            ctx.stroke();
          }

          // Draw particle
          const alpha = particle.life / particle.maxLife;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;

          // Update
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.98;
          particle.vy += 0.08; // gravity
          particle.life--;

          return particle.life > 0;
        });

        ctx.shadowBlur = 0;
        return firework.particles.length > 0;
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [createParticles, playExplosion]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    launchFirework(e.clientX);
  };

  // Handle touch
  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    launchFirework(touch.clientX);
  };

  // Setup canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Auto mode
  useEffect(() => {
    if (isAutoMode) {
      autoIntervalRef.current = setInterval(() => {
        launchFirework();
      }, 800 + Math.random() * 1200);
    } else {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    }

    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    };
  }, [isAutoMode, launchFirework]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleTouch}
        className="w-full h-full cursor-crosshair"
      />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0.3, y: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <Button
          variant={isAutoMode ? 'primary' : 'secondary'}
          onClick={() => setIsAutoMode(!isAutoMode)}
          className="backdrop-blur-md bg-white/10"
        >
          {isAutoMode ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
          {isAutoMode ? 'Stop Show' : 'Auto Show'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => launchFirework()}
          className="backdrop-blur-md bg-white/10"
        >
          <Sparkles size={18} className="mr-2" />
          Launch
        </Button>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 0.7 : 0 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white/70 text-sm"
      >
        Tap anywhere to launch fireworks!
      </motion.p>

      {/* Close button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
      >
        <span className="text-2xl">&times;</span>
      </button>
    </div>
  );
}
