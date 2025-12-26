import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NYE 2026!',
    description: 'Your ultimate New Year celebration companion. Let us show you around!',
    position: 'center',
    icon: '🎉',
  },
  {
    id: 'countdown',
    title: 'Live Countdown',
    description: 'Watch the countdown to midnight with stunning animations and sound effects.',
    target: '[data-tour="countdown"]',
    position: 'bottom',
    icon: '⏰',
  },
  {
    id: 'photo-booth',
    title: 'Photo Booth',
    description: 'Capture memories with fun stickers, filters, and multiple photo modes!',
    target: '[data-tour="photo"]',
    position: 'bottom',
    icon: '📸',
  },
  {
    id: 'fun-zone',
    title: 'Fun Zone',
    description: 'Party games for everyone - trivia, spin wheel, truth or dare, and more!',
    target: '[data-tour="fun"]',
    position: 'bottom',
    icon: '🎮',
  },
  {
    id: 'guest-book',
    title: 'Guest Book',
    description: 'Leave messages and memories for everyone to see.',
    target: '[data-tour="guest"]',
    position: 'bottom',
    icon: '📝',
  },
  {
    id: 'goals',
    title: 'New Year Goals',
    description: 'Set your resolutions and track your progress throughout the year.',
    target: '[data-tour="goals"]',
    position: 'bottom',
    icon: '🎯',
  },
  {
    id: 'shortcuts',
    title: 'Pro Tip: Keyboard Shortcuts',
    description: 'Press Shift + ? anytime to see all keyboard shortcuts. Use 1-7 to navigate tabs!',
    position: 'center',
    icon: '⌨️',
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: "Have an amazing New Year's celebration! 🥂",
    position: 'center',
    icon: '✨',
  },
];

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

const STORAGE_KEY = 'onboarding_completed_2026';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Auto-start tour for first-time users after a short delay
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  return (
    <OnboardingContext.Provider
      value={{ isActive, currentStep, startTour, endTour, nextStep, prevStep, skipTour }}
    >
      {children}
      <AnimatePresence>
        {isActive && <TourOverlay step={TOUR_STEPS[currentStep]} stepIndex={currentStep} totalSteps={TOUR_STEPS.length} />}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
}

interface TourOverlayProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
}

function TourOverlay({ step, stepIndex, totalSteps }: TourOverlayProps) {
  const { nextStep, prevStep, skipTour } = useOnboarding();
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={skipTour} />

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto"
      >
        <div className="bg-surface rounded-2xl p-6 shadow-2xl border border-border/50">
          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-elevated transition-colors"
            aria-label="Skip tour"
          >
            <X size={20} className="text-text-muted" />
          </button>

          {/* Icon */}
          <motion.div
            key={step.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-5xl text-center mb-4"
          >
            {step.icon}
          </motion.div>

          {/* Title */}
          <h2
            className="text-xl font-bold text-text-primary text-center mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-center mb-6">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === stepIndex ? 'bg-gold' : i < stepIndex ? 'bg-purple' : 'bg-border'
                }`}
                animate={i === stepIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirst && (
              <Button variant="secondary" onClick={prevStep} className="flex-1">
                <ChevronLeft size={18} className="mr-1" />
                Back
              </Button>
            )}
            <Button variant="primary" onClick={nextStep} className="flex-1">
              {isLast ? (
                <>
                  <Sparkles size={18} className="mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={18} className="ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <button
              onClick={skipTour}
              className="w-full mt-3 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Button to restart tour (for Settings page)
export function RestartTourButton() {
  const { startTour } = useOnboarding();

  return (
    <Button variant="secondary" onClick={startTour}>
      <Sparkles size={18} className="mr-2" />
      Restart Tour
    </Button>
  );
}
