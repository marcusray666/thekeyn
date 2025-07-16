import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "purple" | "blue" | "cyan" | "emerald";
  floating?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = "default", 
  floating = false 
}: GlassCardProps) {
  const variantClasses = {
    default: "glass-morphism",
    purple: "glass-purple",
    blue: "glass-blue", 
    cyan: "glass-cyan",
    emerald: "glass-emerald",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variantClasses[variant],
        floating && "floating-card",
        className
      )}
    >
      {children}
    </div>
  );
}
