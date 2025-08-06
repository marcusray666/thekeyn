import { OnboardingIllustrations } from "./illustration-generator";

// Define different onboarding tours for different pages/contexts
export const onboardingTours = {
  // First-time upload experience
  uploadFlow: [
    {
      id: "upload-intro",
      title: "Welcome to Loggin'!",
      description: "Let's protect your creative work with blockchain technology. Click the upload button to get started with your first certificate.",
      illustration: OnboardingIllustrations.upload,
      position: "bottom" as const,
      target: "[data-tour='upload-button']",
    },
    {
      id: "upload-formats",
      title: "Any File Type",
      description: "Upload images, videos, audio, documents, or any digital file. We support all formats and sizes up to 2GB.",
      illustration: OnboardingIllustrations.upload,
      position: "left" as const,
      target: "[data-tour='file-input']",
    },
    {
      id: "upload-details",
      title: "Add Your Details",
      description: "Give your work a title and description. You can also add collaborators and tags to make it discoverable.",
      illustration: OnboardingIllustrations.profile,
      position: "left" as const,
      target: "[data-tour='work-details']",
    },
    {
      id: "blockchain-protection",
      title: "Dual Blockchain Protection",
      description: "Your work gets protected on both Ethereum and Bitcoin blockchains, creating an immutable proof of ownership.",
      illustration: OnboardingIllustrations.blockchain,
      position: "top" as const,
      target: "[data-tour='blockchain-info']",
    },
  ],

  // Certificate management experience
  certificateFlow: [
    {
      id: "certificate-intro",
      title: "Your Digital Certificates",
      description: "Each protected work gets a unique certificate with blockchain verification. These are legally valid proofs of ownership.",
      illustration: OnboardingIllustrations.certificate,
      position: "bottom" as const,
      target: "[data-tour='certificate-grid']",
    },
    {
      id: "certificate-details",
      title: "Certificate Features",
      description: "Click any certificate to view blockchain proofs, download verification files, or share with others.",
      illustration: OnboardingIllustrations.certificate,
      position: "left" as const,
      target: "[data-tour='certificate-card']",
    },
    {
      id: "download-proofs",
      title: "Download Blockchain Proofs",
      description: "Get OpenTimestamps (.ots) files and Ethereum proofs for court evidence or copyright submissions.",
      illustration: OnboardingIllustrations.blockchain,
      position: "bottom" as const,
      target: "[data-tour='download-proofs']",
    },
    {
      id: "legal-actions",
      title: "Legal Protection Tools",
      description: "Submit to copyright offices, get notarized, or report theft directly from your certificate.",
      illustration: OnboardingIllustrations.certificate,
      position: "right" as const,
      target: "[data-tour='legal-actions']",
    },
  ],

  // Community sharing experience
  communityFlow: [
    {
      id: "community-intro",
      title: "Join the Creator Community",
      description: "Share your protected works with other creators, get feedback, and discover amazing content.",
      illustration: OnboardingIllustrations.community,
      position: "bottom" as const,
      target: "[data-tour='community-feed']",
    },
    {
      id: "share-work",
      title: "Share Protected Work",
      description: "When you share a protected work, it shows a 'PROTECTED' badge so everyone knows it's blockchain-verified.",
      illustration: OnboardingIllustrations.community,
      position: "left" as const,
      target: "[data-tour='share-button']",
    },
    {
      id: "engage-community",
      title: "Like, Comment, Follow",
      description: "Engage with other creators' work. All interactions help build your reputation in the community.",
      illustration: OnboardingIllustrations.community,
      position: "right" as const,
      target: "[data-tour='engagement-buttons']",
    },
    {
      id: "ai-verification",
      title: "AI Content Verification",
      description: "All posts are verified by AI for safety. Look for the 'Verified by AI' badge on every post.",
      illustration: OnboardingIllustrations.certificate,
      position: "top" as const,
      target: "[data-tour='ai-verified-badge']",
    },
  ],

  // Profile customization experience
  profileFlow: [
    {
      id: "profile-intro",
      title: "Customize Your Profile",
      description: "Create a professional creator profile to showcase your work and connect with other artists.",
      illustration: OnboardingIllustrations.profile,
      position: "bottom" as const,
      target: "[data-tour='profile-section']",
    },
    {
      id: "profile-image",
      title: "Add Profile Photo",
      description: "Upload a profile picture to make your account more personal and trustworthy.",
      illustration: OnboardingIllustrations.profile,
      position: "right" as const,
      target: "[data-tour='profile-avatar']",
    },
    {
      id: "bio-details",
      title: "Tell Your Story",
      description: "Add a bio, website, and location to help other creators learn about you and your work.",
      illustration: OnboardingIllustrations.profile,
      position: "left" as const,
      target: "[data-tour='profile-bio']",
    },
    {
      id: "verification-badge",
      title: "Get Verified",
      description: "Build your reputation to earn a verification badge. Active creators with quality content get verified faster.",
      illustration: OnboardingIllustrations.certificate,
      position: "top" as const,
      target: "[data-tour='verification-badge']",
    },
  ],

  // Dashboard overview experience
  dashboardFlow: [
    {
      id: "dashboard-welcome",
      title: "Your Creator Dashboard",
      description: "Welcome to your creative command center! Here you can manage works, view analytics, and track your progress.",
      illustration: OnboardingIllustrations.profile,
      position: "bottom" as const,
      target: "[data-tour='dashboard-header']",
    },
    {
      id: "quick-stats",
      title: "Track Your Progress",
      description: "Monitor your protected works, community engagement, and subscription usage at a glance.",
      illustration: OnboardingIllustrations.certificate,
      position: "bottom" as const,
      target: "[data-tour='stats-cards']",
    },
    {
      id: "recent-activity",
      title: "Stay Updated",
      description: "See your latest uploads, community interactions, and important notifications in one place.",
      illustration: OnboardingIllustrations.community,
      position: "left" as const,
      target: "[data-tour='recent-activity']",
    },
  ],
};

// Helper function to get tour based on current page/context
export function getTourForContext(context: keyof typeof onboardingTours) {
  return onboardingTours[context] || [];
}