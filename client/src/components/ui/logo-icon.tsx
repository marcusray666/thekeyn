import { Shield, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LogoIcon({ className, size = "md" }: LogoIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const paintbrushSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Shield background */}
      <Shield className={cn(sizeClasses[size], "text-current")} />
      {/* Thin paintbrush overlay */}
      <Paintbrush 
        className={cn(
          paintbrushSizes[size], 
          "absolute text-current opacity-90"
        )} 
        strokeWidth={1.5}
      />
    </div>
  );
}