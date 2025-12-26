import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export function useConfetti() {
  const colors = ['#ffd700', '#9333ea', '#ec4899', '#06b6d4', '#ffffff'];

  const fireConfetti = useCallback(() => {
    // Side cannons effect
    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const fireCelebration = useCallback(() => {
    // Big center explosion for New Year
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Multiple bursts from different origins
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors,
      });
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors,
      });
    }, 250);
  }, []);

  const fireSmall = useCallback(() => {
    // Small celebration for task completion
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ffd700', '#9333ea'],
      scalar: 0.8,
    });
  }, []);

  const fireStars = useCallback(() => {
    // Star-shaped confetti
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 20,
      colors,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 1.2,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        shapes: ['circle'],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  const fireFireworks = useCallback(() => {
    // Firework bursts from bottom
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Launch from bottom
      confetti({
        particleCount: 80,
        startVelocity: 55,
        spread: 80,
        origin: {
          x: randomInRange(0.2, 0.8),
          y: 1,
        },
        colors,
        gravity: 1.2,
        scalar: 1.2,
        drift: randomInRange(-0.5, 0.5),
      });
    }, 400);
  }, []);

  const fireGoldRain = useCallback(() => {
    // Golden rain effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 10,
        startVelocity: 0,
        spread: 360,
        gravity: 0.5,
        origin: {
          x: Math.random(),
          y: -0.1,
        },
        colors: ['#ffd700', '#ffed4a', '#f6e05e', '#ecc94b'],
        shapes: ['circle'],
        scalar: 0.8,
        ticks: 300,
      });
    }, 100);
  }, []);

  return { fireConfetti, fireCelebration, fireSmall, fireStars, fireFireworks, fireGoldRain };
}
