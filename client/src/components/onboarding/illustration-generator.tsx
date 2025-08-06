// AI-generated SVG illustrations for onboarding tooltips
// These are contextual, delightful illustrations that help explain features

export const OnboardingIllustrations = {
  // Upload feature illustration
  upload: `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Gradient definitions -->
      <defs>
        <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FE3F5E"/>
          <stop offset="100%" style="stop-color:#FFD200"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Cloud base -->
      <ellipse cx="24" cy="32" rx="18" ry="8" fill="url(#uploadGrad)" opacity="0.2"/>
      
      <!-- Upload cloud -->
      <path d="M12 28c0-6.6 5.4-12 12-12s12 5.4 12 12c3.3 0 6 2.7 6 6s-2.7 6-6 6H14c-4.4 0-8-3.6-8-8s3.6-8 8-8z" 
            fill="url(#uploadGrad)" opacity="0.8" filter="url(#glow)"/>
      
      <!-- Upload arrow -->
      <g transform="translate(24, 24)">
        <path d="M0 4L-4 8L-2 8L0 6L2 8L4 8L0 4Z" fill="white"/>
        <rect x="-1" y="6" width="2" height="8" fill="white" rx="1"/>
      </g>
      
      <!-- Sparkles -->
      <circle cx="8" cy="18" r="1" fill="#FFD200" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="38" cy="22" r="1.5" fill="#FE3F5E" opacity="0.6">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="34" cy="12" r="1" fill="#FFD200" opacity="0.7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `)}`,

  // Certificate protection illustration
  certificate: `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FE3F5E"/>
          <stop offset="100%" style="stop-color:#FFD200"/>
        </linearGradient>
        <filter id="certGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Certificate base -->
      <rect x="8" y="6" width="32" height="36" rx="4" fill="url(#certGrad)" opacity="0.1"/>
      <rect x="10" y="8" width="28" height="32" rx="2" fill="white" opacity="0.95"/>
      
      <!-- Certificate content lines -->
      <rect x="14" y="14" width="20" height="2" rx="1" fill="url(#certGrad)" opacity="0.6"/>
      <rect x="14" y="18" width="16" height="1.5" rx="0.75" fill="url(#certGrad)" opacity="0.4"/>
      <rect x="14" y="22" width="18" height="1.5" rx="0.75" fill="url(#certGrad)" opacity="0.4"/>
      
      <!-- Shield protection -->
      <g transform="translate(24, 28)">
        <path d="M0 -6L-6 -2V2C-6 6 -3 8 0 10C3 8 6 6 6 2V-2L0 -6Z" 
              fill="url(#certGrad)" filter="url(#certGlow)"/>
        <!-- Checkmark -->
        <path d="M-2 0L-1 1L2 -2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      
      <!-- Blockchain blocks -->
      <g opacity="0.7">
        <rect x="2" y="16" width="4" height="4" rx="1" fill="#FFD200"/>
        <rect x="2" y="22" width="4" height="4" rx="1" fill="#FE3F5E"/>
        <rect x="42" y="18" width="4" height="4" rx="1" fill="#FFD200"/>
        <rect x="42" y="24" width="4" height="4" rx="1" fill="#FE3F5E"/>
        
        <!-- Connection lines -->
        <line x1="4" y1="20" x2="4" y2="22" stroke="url(#certGrad)" stroke-width="1"/>
        <line x1="44" y1="22" x2="44" y2="24" stroke="url(#certGrad)" stroke-width="1"/>
      </g>
    </svg>
  `)}`,

  // Community sharing illustration
  community: `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FE3F5E"/>
          <stop offset="100%" style="stop-color:#FFD200"/>
        </linearGradient>
      </defs>
      
      <!-- Network connections -->
      <g opacity="0.3">
        <line x1="12" y1="12" x2="24" y2="24" stroke="url(#commGrad)" stroke-width="1"/>
        <line x1="36" y1="12" x2="24" y2="24" stroke="url(#commGrad)" stroke-width="1"/>
        <line x1="12" y1="36" x2="24" y2="24" stroke="url(#commGrad)" stroke-width="1"/>
        <line x1="36" y1="36" x2="24" y2="24" stroke="url(#commGrad)" stroke-width="1"/>
      </g>
      
      <!-- User avatars -->
      <circle cx="12" cy="12" r="6" fill="url(#commGrad)" opacity="0.8"/>
      <circle cx="36" cy="12" r="6" fill="url(#commGrad)" opacity="0.6"/>
      <circle cx="12" cy="36" r="6" fill="url(#commGrad)" opacity="0.7"/>
      <circle cx="36" cy="36" r="6" fill="url(#commGrad)" opacity="0.5"/>
      
      <!-- Central hub -->
      <circle cx="24" cy="24" r="8" fill="url(#commGrad)"/>
      <circle cx="24" cy="24" r="6" fill="white"/>
      
      <!-- Heart icon in center -->
      <path d="M24 20C22 18 19 18 19 21C19 24 24 28 24 28S29 24 29 21C29 18 26 18 24 20Z" 
            fill="url(#commGrad)"/>
      
      <!-- Floating hearts -->
      <g opacity="0.6">
        <path d="M8 8C7.5 7.5 6.5 7.5 6.5 8.5C6.5 9.5 8 11 8 11S9.5 9.5 9.5 8.5C9.5 7.5 8.5 7.5 8 8Z" 
              fill="#FFD200">
          <animateTransform attributeName="transform" type="translate" 
                           values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M40 40C39.5 39.5 38.5 39.5 38.5 40.5C38.5 41.5 40 43 40 43S41.5 41.5 41.5 40.5C41.5 39.5 40.5 39.5 40 40Z" 
              fill="#FE3F5E">
          <animateTransform attributeName="transform" type="translate" 
                           values="0,0;0,-3;0,0" dur="2.5s" repeatCount="indefinite"/>
        </path>
      </g>
    </svg>
  `)}`,

  // Profile customization illustration
  profile: `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FE3F5E"/>
          <stop offset="100%" style="stop-color:#FFD200"/>
        </linearGradient>
        <filter id="profGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Profile card background -->
      <rect x="8" y="8" width="32" height="32" rx="8" fill="url(#profGrad)" opacity="0.1"/>
      <rect x="10" y="10" width="28" height="28" rx="6" fill="white" opacity="0.95"/>
      
      <!-- Profile avatar -->
      <circle cx="24" cy="20" r="6" fill="url(#profGrad)" filter="url(#profGlow)"/>
      <circle cx="24" cy="20" r="4" fill="white"/>
      
      <!-- Person icon -->
      <circle cx="24" cy="18" r="2" fill="url(#profGrad)"/>
      <path d="M20 22C20 20 22 20 24 20S28 20 28 22" stroke="url(#profGrad)" stroke-width="1.5" stroke-linecap="round"/>
      
      <!-- Profile info lines -->
      <rect x="14" y="30" width="20" height="2" rx="1" fill="url(#profGrad)" opacity="0.6"/>
      <rect x="16" y="34" width="16" height="1.5" rx="0.75" fill="url(#profGrad)" opacity="0.4"/>
      
      <!-- Customization tools -->
      <g transform="translate(32, 12)" opacity="0.8">
        <circle cx="4" cy="4" r="6" fill="url(#profGrad)" opacity="0.2"/>
        <path d="M1 4L4 1L7 4L4 7L1 4Z" fill="url(#profGrad)"/>
        <!-- Brush -->
        <rect x="3.5" y="3.5" width="1" height="1" fill="white"/>
      </g>
      
      <!-- Stars for customization -->
      <g opacity="0.7">
        <path d="M6 6L6.5 7.5L8 8L6.5 8.5L6 10L5.5 8.5L4 8L5.5 7.5L6 6Z" fill="#FFD200">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M42 36L42.5 37.5L44 38L42.5 38.5L42 40L41.5 38.5L40 38L41.5 37.5L42 36Z" fill="#FE3F5E">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite"/>
        </path>
      </g>
    </svg>
  `)}`,

  // Blockchain verification illustration
  blockchain: `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FE3F5E"/>
          <stop offset="100%" style="stop-color:#FFD200"/>
        </linearGradient>
      </defs>
      
      <!-- Blockchain blocks -->
      <g opacity="0.9">
        <!-- Block 1 -->
        <rect x="4" y="20" width="8" height="8" rx="2" fill="url(#blockGrad)" opacity="0.8"/>
        <rect x="5" y="21" width="6" height="2" rx="1" fill="white" opacity="0.6"/>
        <rect x="5" y="24" width="4" height="1" rx="0.5" fill="white" opacity="0.4"/>
        <rect x="5" y="26" width="5" height="1" rx="0.5" fill="white" opacity="0.4"/>
        
        <!-- Block 2 -->
        <rect x="16" y="20" width="8" height="8" rx="2" fill="url(#blockGrad)" opacity="0.9"/>
        <rect x="17" y="21" width="6" height="2" rx="1" fill="white" opacity="0.6"/>
        <rect x="17" y="24" width="4" height="1" rx="0.5" fill="white" opacity="0.4"/>
        <rect x="17" y="26" width="5" height="1" rx="0.5" fill="white" opacity="0.4"/>
        
        <!-- Block 3 -->
        <rect x="28" y="20" width="8" height="8" rx="2" fill="url(#blockGrad)"/>
        <rect x="29" y="21" width="6" height="2" rx="1" fill="white" opacity="0.6"/>
        <rect x="29" y="24" width="4" height="1" rx="0.5" fill="white" opacity="0.4"/>
        <rect x="29" y="26" width="5" height="1" rx="0.5" fill="white" opacity="0.4"/>
        
        <!-- Connecting chains -->
        <line x1="12" y1="24" x2="16" y2="24" stroke="url(#blockGrad)" stroke-width="2"/>
        <line x1="24" y1="24" x2="28" y2="24" stroke="url(#blockGrad)" stroke-width="2"/>
        
        <!-- Chain links -->
        <circle cx="14" cy="24" r="1.5" fill="none" stroke="url(#blockGrad)" stroke-width="1"/>
        <circle cx="26" cy="24" r="1.5" fill="none" stroke="url(#blockGrad)" stroke-width="1"/>
      </g>
      
      <!-- Security shield -->
      <g transform="translate(40, 8)">
        <path d="M0 0L-4 2V6C-4 8 -2 10 0 12C2 10 4 8 4 6V2L0 0Z" 
              fill="url(#blockGrad)" opacity="0.8"/>
        <path d="M-1.5 4L-0.5 5L1.5 3" stroke="white" stroke-width="1" stroke-linecap="round"/>
      </g>
      
      <!-- Verification checkmarks -->
      <g opacity="0.7">
        <circle cx="8" cy="12" r="3" fill="#00C851" opacity="0.2"/>
        <path d="M6.5 12L7.5 13L9.5 11" stroke="#00C851" stroke-width="1.5" stroke-linecap="round"/>
        
        <circle cx="32" cy="36" r="3" fill="#00C851" opacity="0.2"/>
        <path d="M30.5 36L31.5 37L33.5 35" stroke="#00C851" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </svg>
  `)}`,
};