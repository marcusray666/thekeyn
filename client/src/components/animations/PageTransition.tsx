import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Blockchain-inspired animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    rotateX: 5,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    scale: 1.05,
    rotateX: -5,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.55, 0.085, 0.68, 0.53],
    },
  },
};

// Blockchain grid background animation
const gridVariants = {
  initial: { 
    opacity: 0,
    scale: 0.8,
  },
  animate: { 
    opacity: [0, 0.3, 0],
    scale: [0.8, 1.2, 1.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  },
};

// Digital particles animation
const particleVariants = {
  initial: { 
    opacity: 0,
    y: 100,
    rotate: 0,
  },
  animate: { 
    opacity: [0, 1, 0],
    y: -100,
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      delay: Math.random() * 2,
    }
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Blockchain-inspired background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated grid pattern */}
        <motion.div 
          className="absolute inset-0"
          variants={gridVariants}
          initial="initial"
          animate="animate"
        >
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="blockchain-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blockchain-grid)" className="text-[#FE3F5E]"/>
            </svg>
          </div>
        </motion.div>

        {/* Digital particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#FFD200] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={particleVariants}
            initial="initial"
            animate="animate"
          />
        ))}

        {/* Blockchain connection lines */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <svg className="w-full h-full">
            <path
              d="M 0,200 Q 400,100 800,300 T 1600,200"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M 0,400 Q 300,300 600,500 T 1200,400"
              stroke="url(#gradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FE3F5E" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#FFD200" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#FE3F5E" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Page content with transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          className="relative z-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Route-specific transition variants for different page types
export const routeTransitions = {
  // Home page - expansive animation
  '/': {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.1, y: -30 },
  },
  
  // Upload page - upward motion
  '/upload': {
    initial: { opacity: 0, y: 50, rotateX: 10 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: { opacity: 0, y: -50, rotateX: -10 },
  },
  
  // Certificates - secure fade
  '/certificates': {
    initial: { opacity: 0, scale: 0.95, blur: 10 },
    animate: { opacity: 1, scale: 1, blur: 0 },
    exit: { opacity: 0, scale: 1.05, blur: 10 },
  },
  
  // Settings - slide from right
  '/settings': {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  
  // Profile - personal zoom
  '/profile': {
    initial: { opacity: 0, scale: 0.8, rotateY: 15 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 1.2, rotateY: -15 },
  },
};