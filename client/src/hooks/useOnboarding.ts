import { useState, useEffect } from "react";

const ONBOARDING_STORAGE_KEY = "prooff_onboarding_completed";
const WELCOME_STORAGE_KEY = "prooff_welcome_shown";

export function useOnboarding() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if onboarding was completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_STORAGE_KEY);
    const isCompleted = completed === "true";
    const hasSeenWelcome = welcomeShown === "true";
    
    setIsOnboardingComplete(isCompleted);
    
    // Show welcome modal for brand new users
    if (!hasSeenWelcome) {
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsOnboardingComplete(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const closeWelcome = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    setShowWelcome(false);
  };

  const startTutorialFromWelcome = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    setShowWelcome(false);
    setShowOnboarding(true);
  };

  return {
    isOnboardingComplete,
    showOnboarding,
    showWelcome,
    completeOnboarding,
    resetOnboarding,
    startOnboarding,
    closeOnboarding: () => setShowOnboarding(false),
    closeWelcome,
    startTutorialFromWelcome,
  };
}