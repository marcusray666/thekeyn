/**
 * Media utility functions for handling image URLs and fallbacks
 */

const API_BASE = (import.meta.env as any).VITE_API_BASE || "http://localhost:5000";

/**
 * Build full media URL from relative path
 * @param path - Relative path to media file
 * @returns Full URL with API base
 */
export function buildMediaUrl(path: string): string {
  if (!path) return "";
  
  // If already a full URL, return as is
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }
  
  // Remove leading slash if present and construct full URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE}/${cleanPath}`;
}

/**
 * Get placeholder image SVG for fallback
 * @param className - Optional CSS classes
 * @returns SVG data URL for placeholder
 */
export function getPlaceholderImage(className = ""): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" class="${className}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F7F7F9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <g transform="translate(200,150)">
        <circle r="30" fill="#9CA3AF" opacity="0.5"/>
        <path d="M-15,-10 L-15,10 L15,10 L15,-10 Z M-10,-5 L-10,5 L10,5 L10,-5 Z" fill="white"/>
        <circle cx="5" cy="0" r="3" fill="#9CA3AF"/>
      </g>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Handle image load error with placeholder fallback
 * @param event - Image error event
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  img.src = getPlaceholderImage();
}