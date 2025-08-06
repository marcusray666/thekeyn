import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OnboardingTooltip } from "./tooltip";
import { onboardingTours, getTourForContext } from "./onboarding-tours";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useLocation } from "wouter";

interface OnboardingContextType {
  startTour: (tourType: keyof typeof onboardingTours) => void;
  skipCurrentTour: () => void;
  isOnboardingActive: boolean;
  currentTour: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { onboardingState, markGuideAsSeen, markOnboardingComplete, shouldShowOnboarding } = useOnboarding();
  const [location] = useLocation();

  // Auto-start tours based on page context
  useEffect(() => {
    if (!shouldShowOnboarding()) return;

    // Small delay to ensure page has rendered
    const timer = setTimeout(() => {
      // Determine which tour to show based on current page
      if (location === "/upload" && !onboardingState.hasSeenUploadGuide) {
        startTour("uploadFlow");
      } else if (location === "/certificates" && !onboardingState.hasSeenCertificateGuide) {
        startTour("certificateFlow");
      } else if (location === "/community" && !onboardingState.hasSeenCommunityGuide) {
        startTour("communityFlow");
      } else if (location === "/profile" && !onboardingState.hasSeenProfileGuide) {
        startTour("profileFlow");
      } else if (location === "/dashboard" && !onboardingState.hasSeenUploadGuide) {
        startTour("dashboardFlow");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [location, onboardingState, shouldShowOnboarding]);

  const startTour = (tourType: keyof typeof onboardingTours) => {
    setCurrentTour(tourType);
    setIsTooltipVisible(true);
  };

  const skipCurrentTour = () => {
    if (currentTour) {
      // Mark the current guide as seen
      const guideKey = getGuideKeyFromTour(currentTour);
      if (guideKey) {
        markGuideAsSeen(guideKey);
      }
    }
    setIsTooltipVisible(false);
    setCurrentTour(null);
  };

  const handleTourComplete = () => {
    if (currentTour) {
      // Mark the current guide as seen
      const guideKey = getGuideKeyFromTour(currentTour);
      if (guideKey) {
        markGuideAsSeen(guideKey);
      }
      
      // Check if all guides have been seen
      const allGuidesComplete = 
        onboardingState.hasSeenUploadGuide &&
        onboardingState.hasSeenCertificateGuide &&
        onboardingState.hasSeenCommunityGuide &&
        onboardingState.hasSeenProfileGuide;
      
      if (allGuidesComplete) {
        markOnboardingComplete();
      }
    }
    
    setIsTooltipVisible(false);
    setCurrentTour(null);
  };

  const getGuideKeyFromTour = (tourType: string) => {
    switch (tourType) {
      case "uploadFlow":
      case "dashboardFlow":
        return "hasSeenUploadGuide" as const;
      case "certificateFlow":
        return "hasSeenCertificateGuide" as const;
      case "communityFlow":
        return "hasSeenCommunityGuide" as const;
      case "profileFlow":
        return "hasSeenProfileGuide" as const;
      default:
        return null;
    }
  };

  const getCurrentTourSteps = () => {
    if (!currentTour) return [];
    return getTourForContext(currentTour as keyof typeof onboardingTours);
  };

  const contextValue: OnboardingContextType = {
    startTour,
    skipCurrentTour,
    isOnboardingActive: isTooltipVisible,
    currentTour,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {/* Onboarding tooltip overlay */}
      {isTooltipVisible && currentTour && (
        <OnboardingTooltip
          steps={getCurrentTourSteps()}
          isVisible={isTooltipVisible}
          onComplete={handleTourComplete}
          onSkip={skipCurrentTour}
        />
      )}
    </OnboardingContext.Provider>
  );
}

// Helper component to manually trigger tours
export function OnboardingTrigger({ 
  tourType, 
  children 
}: { 
  tourType: keyof typeof onboardingTours;
  children: ReactNode;
}) {
  const { startTour } = useOnboardingContext();
  
  return (
    <div onClick={() => startTour(tourType)} className="cursor-pointer">
      {children}
    </div>
  );
}