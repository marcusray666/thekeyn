import { useState, useEffect } from "react";

interface OnboardingState {
  hasSeenUploadGuide: boolean;
  hasSeenCertificateGuide: boolean;
  hasSeenCommunityGuide: boolean;
  hasSeenProfileGuide: boolean;
  completedAt?: string;
}

const ONBOARDING_STORAGE_KEY = 'loggin-onboarding-state';

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        hasSeenUploadGuide: false,
        hasSeenCertificateGuide: false,
        hasSeenCommunityGuide: false,
        hasSeenProfileGuide: false,
      };
    } catch {
      return {
        hasSeenUploadGuide: false,
        hasSeenCertificateGuide: false,
        hasSeenCommunityGuide: false,
        hasSeenProfileGuide: false,
      };
    }
  });

  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates };
    setOnboardingState(newState);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newState));
  };

  const markGuideAsSeen = (guide: keyof Omit<OnboardingState, 'completedAt'>) => {
    updateOnboardingState({ [guide]: true });
  };

  const markOnboardingComplete = () => {
    updateOnboardingState({
      hasSeenUploadGuide: true,
      hasSeenCertificateGuide: true,
      hasSeenCommunityGuide: true,
      hasSeenProfileGuide: true,
      completedAt: new Date().toISOString(),
    });
  };

  const resetOnboarding = () => {
    const resetState = {
      hasSeenUploadGuide: false,
      hasSeenCertificateGuide: false,
      hasSeenCommunityGuide: false,
      hasSeenProfileGuide: false,
    };
    setOnboardingState(resetState);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(resetState));
  };

  const shouldShowOnboarding = () => {
    return !onboardingState.completedAt && Object.values(onboardingState).some(seen => !seen);
  };

  return {
    onboardingState,
    markGuideAsSeen,
    markOnboardingComplete,
    resetOnboarding,
    shouldShowOnboarding,
  };
}