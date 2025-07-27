import { cn } from "@/lib/utils";

interface LiquidGlassLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LiquidGlassLoader({ 
  size = "md", 
  className,
  text
}: LiquidGlassLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn(
        "relative",
        sizeClasses[size]
      )}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 animate-spin" 
             style={{ animationDuration: "3s" }} />
        
        {/* Middle pulsing glass */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/30 animate-pulse" 
             style={{ animationDuration: "2s" }} />
        
        {/* Inner floating orb */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-400/60 to-cyan-400/60 shadow-lg animate-bounce" 
             style={{ animationDuration: "1.5s" }} />
        
        {/* Liquid effect overlay */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-transparent via-white/10 to-transparent animate-ping" 
             style={{ animationDuration: "4s" }} />
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-sm font-medium text-white/80 animate-pulse">{text}</p>
          <div className="flex justify-center gap-1 mt-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function FullScreenLoader({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LiquidGlassLoader size="xl" text={text} />
      </div>
    </div>
  );
}

export function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5"
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <div className="absolute inset-0 rounded-full border border-white/30 border-t-white/80 animate-spin" />
      <div className="absolute inset-1 rounded-full bg-white/20 animate-pulse" />
    </div>
  );
}