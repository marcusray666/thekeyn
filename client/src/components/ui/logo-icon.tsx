import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoIcon({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const paintbrushSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
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
        <path 
          d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" 
          stroke="white" 
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