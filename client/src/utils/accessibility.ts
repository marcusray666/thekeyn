/**
 * Accessibility utilities for color contrast, WCAG compliance, and visual accessibility
 */

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  largeTextAA: boolean;
  largeTextAAA: boolean;
  normalTextAA: boolean;
  normalTextAAA: boolean;
}

export interface ColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
  isLight: boolean;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Analyze contrast ratio and WCAG compliance
 */
export function analyzeContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
    largeTextAA: ratio >= 3,
    largeTextAAA: ratio >= 4.5,
    normalTextAA: ratio >= 4.5,
    normalTextAAA: ratio >= 7
  };
}

/**
 * Analyze a color and provide detailed information
 */
export function analyzeColor(hex: string): ColorAnalysis | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  return {
    hex,
    rgb,
    hsl,
    luminance,
    isLight: luminance > 0.5
  };
}

/**
 * Generate accessible color suggestions
 */
export function generateAccessibleColors(baseColor: string, targetRatio: number = 4.5): string[] {
  const base = analyzeColor(baseColor);
  if (!base) return [];
  
  const suggestions: string[] = [];
  
  // Generate lighter and darker variations
  for (let l = 10; l <= 90; l += 10) {
    const testColor = `hsl(${base.hsl.h}, ${base.hsl.s}%, ${l}%)`;
    const ratio = getContrastRatio(baseColor, testColor);
    
    if (ratio >= targetRatio) {
      suggestions.push(testColor);
    }
  }
  
  return suggestions;
}

/**
 * Simulate color blindness
 */
export function simulateColorBlindness(color: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;
  
  // Transformation matrices for different types of color blindness
  const matrices = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758]
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7]
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0.475, 0.525, 0]
    ]
  };
  
  const matrix = matrices[type];
  const newR = Math.round((matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255);
  const newG = Math.round((matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255);
  const newB = Math.round((matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Check if text meets WCAG guidelines for readability
 */
export function checkTextReadability(fontSize: number, fontWeight: 'normal' | 'bold' = 'normal'): {
  isLargeText: boolean;
  requiredContrastAA: number;
  requiredContrastAAA: number;
} {
  const isLargeText = (fontSize >= 18 && fontWeight === 'bold') || fontSize >= 24;
  
  return {
    isLargeText,
    requiredContrastAA: isLargeText ? 3 : 4.5,
    requiredContrastAAA: isLargeText ? 4.5 : 7
  };
}

/**
 * Get the current page's color palette for analysis
 */
export function extractPageColors(): { foreground: string; background: string; primary: string } {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    foreground: computedStyle.getPropertyValue('--foreground').trim() || '#000000',
    background: computedStyle.getPropertyValue('--background').trim() || '#ffffff',
    primary: computedStyle.getPropertyValue('--primary').trim() || '#3b82f6'
  };
}

/**
 * Validate accessibility compliance for the current page
 */
export function validatePageAccessibility(): {
  textContrast: ContrastResult;
  primaryContrast: ContrastResult;
  issues: string[];
  score: number;
} {
  const colors = extractPageColors();
  const textContrast = analyzeContrast(colors.foreground, colors.background);
  const primaryContrast = analyzeContrast(colors.primary, colors.background);
  
  const issues: string[] = [];
  
  if (textContrast.level === 'Fail') {
    issues.push('Text contrast does not meet WCAG AA standards');
  }
  
  if (primaryContrast.level === 'Fail') {
    issues.push('Primary color contrast does not meet WCAG AA standards');
  }
  
  // Check for missing alt text on images
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  // Check for missing form labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputs).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing labels`);
  }
  
  // Calculate accessibility score
  const maxScore = 100;
  const penaltyPerIssue = 20;
  const score = Math.max(0, maxScore - (issues.length * penaltyPerIssue));
  
  return {
    textContrast,
    primaryContrast,
    issues,
    score
  };
}