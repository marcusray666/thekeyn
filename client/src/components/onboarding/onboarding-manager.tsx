import { useState, useEffect } from "react";
import { OnboardingTooltip } from "./tooltip";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  illustration: string;
  targetElement?: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

interface OnboardingManagerProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  autoStart?: boolean;
  tourId: string;
}

export function OnboardingManager({ 
  steps, 
  onComplete, 
  autoStart = true,
  tourId 
}: OnboardingManagerProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (autoStart && steps.length > 0) {
      // Check if tour has been completed
      const completed = localStorage.getItem(`tour-${tourId}-completed`);
      if (!completed) {
        startTour();
      }
    }
  }, [autoStart, steps.length, tourId]);

  const startTour = () => {
    if (steps.length > 0) {
      setCurrentStep(0);
      setIsActive(true);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem(`tour-${tourId}-completed`, 'true');
  };

  const completeTour = () => {
    setIsActive(false);
    setCurrentStep(-1);
    localStorage.setItem(`tour-${tourId}-completed`, 'true');
    onComplete?.();
  };

  if (!isActive || currentStep === -1 || !steps[currentStep]) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <OnboardingTooltip
      id={step.id}
      title={step.title}
      description={step.description}
      illustration={step.illustration}
      targetElement={step.targetElement}
      position={step.position}
      onNext={nextStep}
      onSkip={skipTour}
      onComplete={completeTour}
      isLastStep={currentStep === steps.length - 1}
      stepNumber={currentStep + 1}
      totalSteps={steps.length}
      showOnce={false}
    />
  );
}

// Predefined onboarding flows with AI-generated illustrations
export const ONBOARDING_FLOWS = {
  WELCOME: [
    {
      id: "welcome-logo",
      title: "Welcome to Loggin'!",
      description: "Your creative protection platform where art meets blockchain security. Let's take a quick tour to get you started!",
      illustration: "🛡️",
      targetElement: ".logo-container",
      position: "bottom" as const
    },
    {
      id: "welcome-features",
      title: "Protect Your Art",
      description: "Generate blockchain certificates that prove ownership and creation timestamp of your work with legal-grade protection.",
      illustration: "🔒",
      targetElement: ".features-section",
      position: "top" as const
    },
    {
      id: "welcome-get-started",
      title: "Ready to Begin?",
      description: "Click 'Sign up' to create your account and start protecting your creative work with blockchain technology!",
      illustration: "🚀",
      targetElement: ".cta-button",
      position: "top" as const
    }
  ],
  
  DASHBOARD: [
    {
      id: "dashboard-welcome",
      title: "Welcome to Your Dashboard!",
      description: "This is your creative command center. Here you can upload works, view certificates, and connect with the community.",
      illustration: "🎨",
      position: "bottom" as const
    },
    {
      id: "dashboard-community",
      title: "Join the Creative Community",
      description: "Share your protected works with other creators, get feedback, and build your artistic network through authentic connections.",
      illustration: "👥",
      position: "bottom" as const
    },
    {
      id: "dashboard-next-steps",
      title: "Ready to Create?",
      description: "Head to the Studio to upload your first work and get instant blockchain protection. Your creative journey starts now!",
      illustration: "✨",
      position: "bottom" as const
    }
  ],

  UPLOAD: [
    {
      id: "upload-drag-drop",
      title: "Upload Made Easy!",
      description: "Simply drag and drop your files here or click to browse. We'll handle the rest with automated blockchain protection.",
      illustration: "⬆️",
      targetElement: "[data-testid='upload-zone']",
      position: "top" as const
    },
    {
      id: "upload-details", 
      title: "Add Work Details",
      description: "Provide a title and description for your work. This information becomes part of your blockchain certificate.",
      illustration: "✍️",
      targetElement: "[data-testid='work-details']",
      position: "right" as const
    },
    {
      id: "upload-protection",
      title: "Blockchain Protection",
      description: "Once uploaded, your work gets a unique blockchain signature that proves ownership and timestamp forever.",
      illustration: "🔐",
      targetElement: "[data-testid='protection-info']",
      position: "left" as const
    }
  ],

  STUDIO: [
    {
      id: "studio-overview",
      title: "Your Creative Studio",
      description: "This is your personal studio where you can manage all your protected works and certificates with professional tools.",
      illustration: "🎨",
      targetElement: "[data-testid='studio-header']",
      position: "bottom" as const
    },
    {
      id: "studio-upload-tab",
      title: "Upload New Works",
      description: "Switch to the Upload tab to protect new creative works with instant blockchain certificates.",
      illustration: "⬆️",
      position: "bottom" as const
    },
    {
      id: "studio-certificates",
      title: "Manage Your Certificates",
      description: "View, download, and share your blockchain-protected works. Each certificate is legally binding proof of ownership.",
      illustration: "📜",
      position: "bottom" as const
    }
  ]
};