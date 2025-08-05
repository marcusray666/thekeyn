import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple" | "blue" | "cyan" | "emerald";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-black/20 backdrop-blur-sm border border-white/10",
      purple: "bg-purple-500/10 backdrop-blur-sm border border-purple-500/20",
      blue: "bg-blue-500/10 backdrop-blur-sm border border-blue-500/20",
      cyan: "bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20",
      emerald: "bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20",
    };

    return (
      <div
        className={cn(
          "rounded-lg",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };