import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Upload, Shield, Award, Settings, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useLocation } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Loggin!',
    description: 'Your digital copyright protection platform. Let\'s take a quick tour to get you started.',
    icon: Shield,
  },
  {
    id: 'upload',
    title: 'Upload Your Work',
    description: 'Click the Upload button to protect your first digital creation. We support images, audio, videos, and documents.',
    icon: Upload,
    targetSelector: '[data-tutorial="upload-button"]',
    position: 'bottom',
    action: {
      text: 'Try Upload',
      onClick: () => window.location.href = '/upload-work'
    }
  },
  {
    id: 'certificates',
    title: 'View Your Certificates',
    description: 'All your protected works appear here with blockchain-verified certificates of authenticity.',
    icon: Award,
    targetSelector: '[data-tutorial="certificates-button"]',
    position: 'bottom',
  },
  {
    id: 'dashboard',
    title: 'Monitor Your Portfolio',
    description: 'Your dashboard shows statistics, recent activity, and analytics for all your protected works.',
    icon: Settings,
    targetSelector: '[data-tutorial="dashboard-button"]',
    position: 'bottom',
  },
  {
    id: 'collaboration',
    title: 'Add Collaborators',
    description: 'When uploading, you can add collaborators to shared works for joint ownership protection.',
    icon: Users,
  },
  {
    id: 'protection',
    title: 'Report Theft',
    description: 'If someone steals your work, use our automated DMCA takedown system to protect your rights.',
    icon: AlertTriangle,
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  // Get target element position for highlighting
  const getTargetPosition = () => {
    if (!step.targetSelector) return null;
    
    const element = document.querySelector(step.targetSelector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  const targetPosition = getTargetPosition();

  const getTooltipStyle = () => {
    if (!targetPosition || !step.position) return {};
    
    const tooltipOffset = 20;
    
    switch (step.position) {
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + tooltipOffset,
          left: targetPosition.left + (targetPosition.width / 2),
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          top: targetPosition.top - tooltipOffset,
          left: targetPosition.left + (targetPosition.width / 2),
          transform: 'translateX(-50%) translateY(-100%)',
        };
      case 'right':
        return {
          top: targetPosition.top + (targetPosition.height / 2),
          left: targetPosition.left + targetPosition.width + tooltipOffset,
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          top: targetPosition.top + (targetPosition.height / 2),
          left: targetPosition.left - tooltipOffset,
          transform: 'translateY(-50%) translateX(-100%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-40" />
      
      {/* Highlight target element */}
      {targetPosition && (
        <div
          className="fixed z-45 border-2 border-purple-400 rounded-lg pointer-events-none"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
            boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.3)',
          }}
        />
      )}

      {/* Tutorial Content */}
      <div
        className="fixed z-50"
        style={
          targetPosition && step.position
            ? getTooltipStyle()
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        <GlassCard className="w-96 max-w-[90vw]">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-900/30 mr-3">
                  <step.icon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400">
                    Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Action button */}
            {step.action && (
              <div className="mb-4">
                <Button
                  onClick={step.action.onClick}
                  className="w-full btn-glass py-2 rounded-xl font-semibold text-white"
                >
                  {step.action.text}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Skip Tutorial
                </Button>
              </div>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className="btn-glass py-2 px-4 rounded-xl font-semibold text-white"
                >
                  {isLastStep ? 'Complete' : 'Next'}
                  {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}