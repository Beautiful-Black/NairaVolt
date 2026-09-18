import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MapPin, Wrench, Bell, FileDown } from 'lucide-react';

const ONBOARDING_KEY = 'nairavolt-onboarded';

interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: OnboardingStep[] = [
  {
    targetId: 'onboard-locations',
    title: 'Create your locations',
    description: 'Use the location selector to create and switch between places such as a home, shop, or office.',
    icon: <MapPin size={18} />,
  },
  {
    targetId: 'onboard-spaces',
    title: 'Record spaces and appliances',
    description: 'Add your own spaces, then enter each appliance name, wattage, quantity, and daily hours.',
    icon: <Wrench size={18} />,
  },
  {
    targetId: 'onboard-alerts',
    title: 'Set practical alert limits',
    description: 'Choose the wattage and hours limits that should appear in your manual Alert Centre.',
    icon: <Bell size={18} />,
  },
  {
    targetId: 'onboard-reports',
    title: 'Export your audit',
    description: 'Download a printable report or raw CSV whenever you need to share the estimate.',
    icon: <FileDown size={18} />,
  },
];

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay so the page renders first
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep, completeOnboarding]);

  const prev = useCallback(() => {
    setCurrentStep(s => Math.max(0, s - 1));
  }, []);

  return { showOnboarding, currentStep, next, prev, completeOnboarding, steps: STEPS };
};

interface OnboardingOverlayProps {
  show: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const OnboardingOverlay = ({ show, currentStep, steps, onNext, onPrev, onSkip }: OnboardingOverlayProps) => {
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Scroll to the target element
  useEffect(() => {
    if (!show || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [show, step]);

  return (
    <AnimatePresence>
      {show && step && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Highlight ring on target */}
          <HighlightRing targetId={step.targetId} />

          {/* Tooltip card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-4 right-4 z-[60] max-w-md mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-5">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <button
                  onClick={onSkip}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="font-bold text-foreground text-base mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={onPrev}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={onSkip}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={onNext}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/** Renders a pulsing ring around the target element */
const HighlightRing = ({ targetId }: { targetId: string }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
    }
  }, [targetId]);

  if (!rect) return null;

  const pad = 6;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-[55] pointer-events-none rounded-2xl border-2 border-primary shadow-[0_0_0_4000px_rgba(0,0,0,0.4)]"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        boxShadow: `0 0 0 4000px rgba(0,0,0,0.0), 0 0 20px 4px hsl(var(--primary) / 0.3)`,
      }}
    />
  );
};

export default OnboardingOverlay;
