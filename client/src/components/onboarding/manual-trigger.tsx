import { Button } from "@/components/ui/button";
import { HelpCircle, Sparkles } from "lucide-react";
import { useOnboardingContext } from "./onboarding-provider";
import { onboardingTours } from "./onboarding-tours";

interface OnboardingManualTriggerProps {
  tourType: keyof typeof onboardingTours;
  variant?: "icon" | "button" | "text";
  className?: string;
}

export function OnboardingManualTrigger({ 
  tourType, 
  variant = "button",
  className = "" 
}: OnboardingManualTriggerProps) {
  const { startTour } = useOnboardingContext();

  const handleStartTour = () => {
    startTour(tourType);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartTour}
        className={`w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10 ${className}`}
        title="Show guided tour"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleStartTour}
        className={`text-sm text-white/60 hover:text-white underline ${className}`}
      >
        Need help?
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartTour}
      className={`text-white/80 border-white/20 hover:bg-white/10 ${className}`}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Quick Tour
    </Button>
  );
}

// Predefined quick access triggers for common areas
export function UploadTourTrigger({ className }: { className?: string }) {
  return <OnboardingManualTrigger tourType="uploadFlow" variant="icon" className={className} />;
}

export function CertificatesTourTrigger({ className }: { className?: string }) {
  return <OnboardingManualTrigger tourType="certificateFlow" variant="icon" className={className} />;
}

export function CommunityTourTrigger({ className }: { className?: string }) {
  return <OnboardingManualTrigger tourType="communityFlow" variant="icon" className={className} />;
}

export function ProfileTourTrigger({ className }: { className?: string }) {
  return <OnboardingManualTrigger tourType="profileFlow" variant="icon" className={className} />;
}