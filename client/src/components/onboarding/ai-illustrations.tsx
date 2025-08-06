/**
 * AI-Generated Illustrations for Onboarding Tooltips
 * Delightful SVG illustrations created specifically for contextual guidance
 */

import React from "react";

interface IllustrationProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32"
};

// Welcome Shield Illustration - Protection concept
export function WelcomeShieldIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FE3F5E" />
          <stop offset="100%" stopColor="#FFD200" />
        </linearGradient>
      </defs>
      {/* Shield background */}
      <path d="M50 10 L75 25 L75 60 C75 70 65 85 50 90 C35 85 25 70 25 60 L25 25 Z" 
            fill="url(#welcomeGrad)" opacity="0.2"/>
      {/* Shield outline */}
      <path d="M50 10 L75 25 L75 60 C75 70 65 85 50 90 C35 85 25 70 25 60 L25 25 Z" 
            stroke="url(#welcomeGrad)" strokeWidth="2" fill="none"/>
      {/* Paintbrush inside */}
      <line x1="45" y1="35" x2="55" y2="65" stroke="url(#welcomeGrad)" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="45" cy="35" rx="3" ry="6" fill="url(#welcomeGrad)"/>
      {/* Sparkles */}
      <circle cx="35" cy="30" r="1.5" fill="#FFD200" opacity="0.8"/>
      <circle cx="65" cy="35" r="1" fill="#FE3F5E" opacity="0.8"/>
      <circle cx="40" cy="70" r="1" fill="#FFD200" opacity="0.6"/>
    </svg>
  );
}

// Upload Cloud Illustration - File upload concept
export function UploadCloudIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Cloud */}
      <path d="M30 55 C25 55 20 50 20 45 C20 38 25 32 32 32 C35 25 42 20 50 20 C60 20 68 28 68 38 C73 38 78 43 78 48 C78 53 73 58 68 58 L32 58 Z" 
            fill="url(#uploadGrad)" opacity="0.3"/>
      {/* Upload arrow */}
      <path d="M50 45 L50 70" stroke="url(#uploadGrad)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M45 50 L50 45 L55 50" stroke="url(#uploadGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* File icon */}
      <rect x="42" y="75" width="16" height="20" rx="2" fill="url(#uploadGrad)" opacity="0.4"/>
      <line x1="46" y1="80" x2="54" y2="80" stroke="#fff" strokeWidth="1"/>
      <line x1="46" y1="85" x2="54" y2="85" stroke="#fff" strokeWidth="1"/>
    </svg>
  );
}

// Certificate Badge Illustration - Achievement concept
export function CertificateBadgeIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Badge circle */}
      <circle cx="50" cy="40" r="25" fill="url(#certGrad)" opacity="0.3"/>
      <circle cx="50" cy="40" r="25" stroke="url(#certGrad)" strokeWidth="2" fill="none"/>
      {/* Certificate symbol */}
      <rect x="40" y="32" width="20" height="16" rx="2" fill="url(#certGrad)" opacity="0.6"/>
      <line x1="44" y1="37" x2="56" y2="37" stroke="#fff" strokeWidth="1"/>
      <line x1="44" y1="41" x2="52" y2="41" stroke="#fff" strokeWidth="1"/>
      {/* Ribbons */}
      <path d="M45 65 L45 85 L50 80 L55 85 L55 65" fill="url(#certGrad)" opacity="0.7"/>
      {/* Stars */}
      <path d="M25 25 L27 31 L33 31 L28 35 L30 41 L25 37 L20 41 L22 35 L17 31 L23 31 Z" 
            fill="#FFD200" opacity="0.8"/>
      <path d="M75 55 L76 59 L80 59 L77 62 L78 66 L75 63 L72 66 L73 62 L70 59 L74 59 Z" 
            fill="#FE3F5E" opacity="0.8"/>
    </svg>
  );
}

// Community Network Illustration - Social connections
export function CommunityNetworkIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="communityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      {/* Connection lines */}
      <line x1="30" y1="30" x2="50" y2="50" stroke="url(#communityGrad)" strokeWidth="2" opacity="0.6"/>
      <line x1="70" y1="30" x2="50" y2="50" stroke="url(#communityGrad)" strokeWidth="2" opacity="0.6"/>
      <line x1="30" y1="70" x2="50" y2="50" stroke="url(#communityGrad)" strokeWidth="2" opacity="0.6"/>
      <line x1="70" y1="70" x2="50" y2="50" stroke="url(#communityGrad)" strokeWidth="2" opacity="0.6"/>
      {/* User nodes */}
      <circle cx="30" cy="30" r="8" fill="url(#communityGrad)" opacity="0.4"/>
      <circle cx="70" cy="30" r="8" fill="url(#communityGrad)" opacity="0.4"/>
      <circle cx="30" cy="70" r="8" fill="url(#communityGrad)" opacity="0.4"/>
      <circle cx="70" cy="70" r="8" fill="url(#communityGrad)" opacity="0.4"/>
      <circle cx="50" cy="50" r="12" fill="url(#communityGrad)" opacity="0.6"/>
      {/* User icons */}
      <circle cx="30" cy="27" r="2" fill="#fff"/>
      <path d="M25 35 C25 32 27 30 30 30 C33 30 35 32 35 35" stroke="#fff" strokeWidth="1" fill="none"/>
      <circle cx="70" cy="27" r="2" fill="#fff"/>
      <path d="M65 35 C65 32 67 30 70 30 C73 30 75 32 75 35" stroke="#fff" strokeWidth="1" fill="none"/>
      <circle cx="50" cy="47" r="3" fill="#fff"/>
      <path d="M43 57 C43 53 46 50 50 50 C54 50 57 53 57 57" stroke="#fff" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

// Blockchain Lock Illustration - Security concept
export function BlockchainLockIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="blockchainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Blockchain blocks */}
      <rect x="20" y="20" width="15" height="15" rx="2" fill="url(#blockchainGrad)" opacity="0.3"/>
      <rect x="40" y="20" width="15" height="15" rx="2" fill="url(#blockchainGrad)" opacity="0.5"/>
      <rect x="60" y="20" width="15" height="15" rx="2" fill="url(#blockchainGrad)" opacity="0.3"/>
      {/* Chain links */}
      <line x1="35" y1="27" x2="40" y2="27" stroke="url(#blockchainGrad)" strokeWidth="2"/>
      <line x1="55" y1="27" x2="60" y2="27" stroke="url(#blockchainGrad)" strokeWidth="2"/>
      {/* Lock */}
      <rect x="40" y="55" width="20" height="25" rx="3" fill="url(#blockchainGrad)" opacity="0.4"/>
      <path d="M45 55 L45 50 C45 45 47 43 50 43 C53 43 55 45 55 50 L55 55" 
            stroke="url(#blockchainGrad)" strokeWidth="2" fill="none"/>
      <circle cx="50" cy="65" r="3" fill="#fff"/>
      {/* Security waves */}
      <circle cx="50" cy="50" r="30" stroke="url(#blockchainGrad)" strokeWidth="1" opacity="0.3" fill="none"/>
      <circle cx="50" cy="50" r="35" stroke="url(#blockchainGrad)" strokeWidth="1" opacity="0.2" fill="none"/>
    </svg>
  );
}

// Analytics Chart Illustration - Data insights
export function AnalyticsChartIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      {/* Chart bars */}
      <rect x="20" y="60" width="8" height="25" rx="2" fill="url(#analyticsGrad)" opacity="0.6"/>
      <rect x="35" y="45" width="8" height="40" rx="2" fill="url(#analyticsGrad)" opacity="0.8"/>
      <rect x="50" y="35" width="8" height="50" rx="2" fill="url(#analyticsGrad)"/>
      <rect x="65" y="50" width="8" height="35" rx="2" fill="url(#analyticsGrad)" opacity="0.7"/>
      {/* Growth arrow */}
      <path d="M75 30 L85 20 L85 27 L90 27 L90 33 L85 33 L85 40 Z" 
            fill="#10B981" opacity="0.8"/>
      {/* Data points */}
      <circle cx="24" cy="55" r="2" fill="#FFD200"/>
      <circle cx="39" cy="40" r="2" fill="#FFD200"/>
      <circle cx="54" cy="30" r="2" fill="#FFD200"/>
      <circle cx="69" cy="45" r="2" fill="#FFD200"/>
      {/* Trend line */}
      <path d="M24 55 Q39 40 54 30 Q69 35 69 45" 
            stroke="#10B981" strokeWidth="2" fill="none" opacity="0.6"/>
    </svg>
  );
}

// Magic Wand Illustration - AI processing
export function MagicWandIllustration({ className = "", size = "lg" }: IllustrationProps) {
  return (
    <svg className={`${sizeClasses[size]} ${className}`} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="magicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* Wand */}
      <line x1="25" y1="75" x2="65" y2="35" stroke="url(#magicGrad)" strokeWidth="3" strokeLinecap="round"/>
      {/* Wand tip */}
      <path d="M65 35 L70 30 L75 35 L70 40 Z" fill="url(#magicGrad)"/>
      {/* Magic sparkles */}
      <path d="M80 25 L82 30 L87 30 L83 33 L85 38 L80 35 L75 38 L77 33 L73 30 L78 30 Z" 
            fill="#FFD200" opacity="0.9"/>
      <circle cx="30" cy="50" r="2" fill="#FE3F5E" opacity="0.8"/>
      <circle cx="45" cy="20" r="1.5" fill="#FFD200" opacity="0.7"/>
      <circle cx="85" cy="60" r="1" fill="#FE3F5E" opacity="0.6"/>
      <path d="M20 30 L21 33 L24 33 L22 35 L23 38 L20 36 L17 38 L18 35 L16 33 L19 33 Z" 
            fill="#8B5CF6" opacity="0.7"/>
      {/* Magic trail */}
      <path d="M65 35 Q55 45 45 55 Q35 65 25 75" 
            stroke="url(#magicGrad)" strokeWidth="1" opacity="0.4" fill="none" strokeDasharray="2,2"/>
    </svg>
  );
}

// Export all illustrations
export const AIIllustrations = {
  WelcomeShieldIllustration,
  UploadCloudIllustration,
  CertificateBadgeIllustration,
  CommunityNetworkIllustration,
  BlockchainLockIllustration,
  AnalyticsChartIllustration,
  MagicWandIllustration
};