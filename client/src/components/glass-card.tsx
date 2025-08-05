import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function GlassCard({ 
  children, 
  className, 
  hover = false, 
  clickable = false,
  onClick 
}: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card",
        "bg-white/5 backdrop-blur-xl border border-white/10",
        "rounded-2xl p-6 shadow-2xl",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl hover:bg-white/10",
        clickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}