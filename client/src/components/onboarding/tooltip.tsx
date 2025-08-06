import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  illustration?: string; // Base64 SVG or image URL
  position: "top" | "bottom" | "left" | "right";
  target: string; // CSS selector
  action?: () => void;
}

interface OnboardingTooltipProps {
  steps: TooltipStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTooltip({ steps, isVisible, onComplete, onSkip }: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement || !tooltipRef.current) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (step.position) {
      case "top":
        top = targetRect.top - tooltipRect.height - 12;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = targetRect.bottom + 12;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 12;
        break;
      case "right":
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 12;
        break;
    }

    // Keep tooltip within viewport
    const padding = 16;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      // Highlight target element
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        targetElement.classList.add('onboarding-highlight');
        
        // Scroll into view if needed
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update position after a brief delay
        setTimeout(updateTooltipPosition, 100);
      }
    }

    return () => {
      // Clean up highlights
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [currentStep, isVisible]);

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      window.addEventListener('scroll', updateTooltipPosition);
    }

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition);
    };
  }, [isVisible, currentStep]);

  if (!isVisible || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (step.action) {
      step.action();
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-80 bg-[#0F0F0F] border border-white/20 rounded-2xl shadow-2xl"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      >
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/10 via-transparent to-[#FFD200]/10 rounded-2xl" />
        <div className="absolute inset-0 backdrop-blur-xl rounded-2xl" />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-white/60">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Illustration */}
          {step.illustration && (
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-xl flex items-center justify-center">
                <img 
                  src={step.illustration} 
                  alt="Onboarding illustration"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-[#FE3F5E] to-[#FFD200]'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] text-white text-sm px-4 py-2 rounded-xl hover:opacity-90"
            >
              {isLastStep ? 'Complete' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Pointer/Arrow */}
        <div
          className={`absolute w-0 h-0 ${
            step.position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#0F0F0F]' :
            step.position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#0F0F0F]' :
            step.position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-[#0F0F0F]' :
            'right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-[#0F0F0F]'
          }`}
        />
      </div>
    </>
  );
}