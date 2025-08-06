import { useState } from "react";

export interface OnboardingState {
  isActive: boolean;
  currentFlow: string | null;
  currentStep: number;
  hasCompletedFlow: (flowId: string) => boolean;
  startFlow: (flowId: string) => void;
  completeFlow: (flowId: string) => void;
  skipFlow: (flowId: string) => void;
  resetFlow: (flowId: string) => void;
  resetAllFlows: () => void;
}

export function useOnboarding(): OnboardingState {
  const [isActive, setIsActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const hasCompletedFlow = (flowId: string): boolean => {
    return localStorage.getItem(`tour-${flowId}-completed`) === 'true';
  };

  const startFlow = (flowId: string) => {
    if (!hasCompletedFlow(flowId)) {
      setCurrentFlow(flowId);
      setCurrentStep(0);
      setIsActive(true);
    }
  };

  const completeFlow = (flowId: string) => {
    localStorage.setItem(`tour-${flowId}-completed`, 'true');
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(0);
  };

  const skipFlow = (flowId: string) => {
    localStorage.setItem(`tour-${flowId}-completed`, 'true');
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStep(0);
  };

  const resetFlow = (flowId: string) => {
    localStorage.removeItem(`tour-${flowId}-completed`);
  };

  const resetAllFlows = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('tour-') && key.endsWith('-completed')) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    isActive,
    currentFlow,
    currentStep,
    hasCompletedFlow,
    startFlow,
    completeFlow,
    skipFlow,
    resetFlow,
    resetAllFlows
  };
}

// Hook for managing onboarding triggers based on user actions
export function useOnboardingTriggers() {
  const onboarding = useOnboarding();

  const triggerWelcomeFlow = () => {
    // Trigger welcome flow for new users
    if (!onboarding.hasCompletedFlow('WELCOME')) {
      setTimeout(() => onboarding.startFlow('WELCOME'), 1000);
    }
  };

  const triggerDashboardFlow = () => {
    // Trigger dashboard flow for users who completed welcome
    if (onboarding.hasCompletedFlow('WELCOME') && !onboarding.hasCompletedFlow('DASHBOARD')) {
      setTimeout(() => onboarding.startFlow('DASHBOARD'), 500);
    }
  };

  const triggerUploadFlow = () => {
    // Trigger upload flow when user visits upload page for first time
    if (!onboarding.hasCompletedFlow('UPLOAD')) {
      setTimeout(() => onboarding.startFlow('UPLOAD'), 800);
    }
  };

  const triggerStudioFlow = () => {
    // Trigger studio flow when user visits studio for first time
    if (!onboarding.hasCompletedFlow('STUDIO')) {
      setTimeout(() => onboarding.startFlow('STUDIO'), 600);
    }
  };

  return {
    ...onboarding,
    triggerWelcomeFlow,
    triggerDashboardFlow,
    triggerUploadFlow,
    triggerStudioFlow
  };
}