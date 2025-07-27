import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'default'
  floating?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', floating = false, children, ...props }, ref) => {
    const variantClasses = {
      purple: 'border-purple-500/20 bg-purple-500/10',
      blue: 'border-blue-500/20 bg-blue-500/10', 
      cyan: 'border-cyan-500/20 bg-cyan-500/10',
      emerald: 'border-emerald-500/20 bg-emerald-500/10',
      default: 'border-white/20 bg-white/10'
    }

    const floatingClass = floating ? 'hover:translate-y-[-4px] transition-transform duration-300' : ''

    return (
      <div
        ref={ref}
        className={cn(
          // Base glass morphism styles
          "backdrop-blur-xl border rounded-2xl shadow-2xl",
          // Glass effect with transparency
          "bg-white/10 backdrop-saturate-150",
          // Border and glow effect
          "border-white/20",
          // Hover and animation effects
          floatingClass,
          // Variant-specific styling
          variantClasses[variant],
          // Padding
          "p-6",
          className
        )}
        style={{
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }