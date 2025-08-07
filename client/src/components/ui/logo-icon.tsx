import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoIcon({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16", 
    lg: "w-20 h-20"
  };

  const paintbrushSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Gradient Shield outline */}
      <svg 
        className={cn(sizeClasses[size])} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FE3F5E" />
            <stop offset="100%" stopColor="#FFD200" />
          </linearGradient>
        </defs>
        <path 
          d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" 
          stroke="url(#shield-gradient)" 
          strokeWidth="2" 
          fill="none"
        />
      </svg>
      {/* Thin paintbrush overlay */}
      <Paintbrush 
        className={cn(
          paintbrushSizes[size], 
          "absolute text-white"
        )} 
        strokeWidth={1.5}
        style={{
          filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))'
        }}
      />
    </div>
  );
}