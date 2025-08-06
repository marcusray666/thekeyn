import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TooltipProps {
  id: string;
  title: string;
  description: string;
  illustration?: string;
  position?: "top" | "bottom" | "left" | "right";
  targetElement?: string; // CSS selector for the target element
  onNext?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  isLastStep?: boolean;
  stepNumber?: number;
  totalSteps?: number;
  showOnce?: boolean;
}

export function OnboardingTooltip({
  id,
  title,
  description,
  illustration,
  position = "bottom",
  targetElement,
  onNext,
  onSkip,
  onComplete,
  isLastStep = false,
  stepNumber = 1,
  totalSteps = 1,
  showOnce = true
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if this tooltip should be shown
    if (showOnce) {
      const hasBeenShown = localStorage.getItem(`tooltip-${id}-shown`);
      if (hasBeenShown) return;
    }

    // Find target element and position tooltip
    if (targetElement) {
      const target = document.querySelector(targetElement);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [id, targetElement, showOnce]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) {
      localStorage.setItem(`tooltip-${id}-shown`, 'true');
    }
    onSkip?.();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      if (showOnce) {
        localStorage.setItem(`tooltip-${id}-shown`, 'true');
      }
      setIsVisible(false);
      onNext?.();
    }
  };

  const handleComplete = () => {
    if (showOnce) {
      localStorage.setItem(`tooltip-${id}-shown`, 'true');
    }
    setIsVisible(false);
    onComplete?.();
  };

  const getTooltipPosition = () => {
    if (!targetRect) return { top: 50, left: 50 };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (position) {
      case "top":
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        };
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.right + padding
        };
      default:
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2
        };
    }
  };

  if (!isVisible) return null;

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      
      {/* Target highlight */}
      {targetRect && (
        <div
          className="fixed border-2 border-[#FE3F5E] rounded-lg shadow-lg z-50 pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 4px rgba(254, 63, 94, 0.2)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-300"
        )}
        style={{
          top: Math.max(16, Math.min(window.innerHeight - 220, tooltipPosition.top)),
          left: Math.max(16, Math.min(window.innerWidth - 336, tooltipPosition.left))
        }}
      >
        {/* Header */}
        <div className="relative">
          {illustration && (
            <div className="h-32 bg-gradient-to-br from-[#FE3F5E]/10 via-[#FFD200]/10 to-[#FE3F5E]/20 flex items-center justify-center">
              <div className="text-6xl">{illustration}</div>
            </div>
          )}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {stepNumber} of {totalSteps}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-4">
            <div 
              className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] h-1 rounded-full transition-all duration-300"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip tour
            </Button>
            
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white hover:opacity-90"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}