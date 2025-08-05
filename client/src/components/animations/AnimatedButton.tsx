import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "blockchain";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export default function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = ""
}: AnimatedButtonProps) {
  
  const baseClasses = "relative overflow-hidden rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white hover:from-[#FF2D4A] hover:to-[#FE3F5E]",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
    blockchain: "bg-gradient-to-r from-[#FFD200] to-[#FFA000] text-black hover:from-[#FFC000] hover:to-[#FFD200]"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: "easeInOut"
      }
    }
  };

  const rippleVariants = {
    initial: {
      scale: 0,
      opacity: 0.8,
    },
    animate: {
      scale: 4,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const shimmerVariants = {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={disabled ? undefined : onClick}
      variants={buttonVariants}
      whileHover={disabled ? {} : "hover"}
      whileTap={disabled ? {} : "tap"}
      disabled={disabled}
    >
      {/* Shimmer effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          animate="animate"
          style={{ width: "30%" }}
        />
      )}

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full"
        variants={rippleVariants}
        initial="initial"
        whileTap="animate"
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Blockchain-inspired border animation */}
      {variant === "blockchain" && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          initial={{ background: "transparent" }}
          whileHover={{
            background: "linear-gradient(45deg, transparent 30%, rgba(255, 210, 0, 0.3) 50%, transparent 70%)"
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

// Floating Action Button with blockchain animation
export function BlockchainFAB({ onClick, children, className = "" }: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full shadow-2xl flex items-center justify-center text-white z-50 ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        rotate: 360,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(254, 63, 94, 0.4)",
          "0 0 0 20px rgba(254, 63, 94, 0)",
          "0 0 0 0 rgba(254, 63, 94, 0)"
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Inner glow effect */}
      <motion.div
        className="absolute inset-2 rounded-full bg-white/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
}