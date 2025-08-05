import { motion } from "framer-motion";

interface BlockchainLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export default function BlockchainLoader({ 
  size = "md", 
  color = "#FE3F5E" 
}: BlockchainLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const blockVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 1, 0.3],
      rotate: [0, 180, 360],
    }
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {/* Central blockchain block */}
      <motion.div 
        className="absolute w-4 h-4 border-2 rounded-sm"
        style={{ borderColor: color }}
        variants={blockVariants}
        animate="animate"
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Surrounding connection blocks */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: color,
            transformOrigin: size === "sm" ? "16px" : size === "md" ? "24px" : "32px"
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear"
          }}
          initial={{ rotate: i * 90 }}
        />
      ))}

      {/* Digital pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-opacity-20"
        style={{ borderColor: color }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
    </div>
  );
}

// Blockchain network animation component
export function BlockchainNetwork() {
  const nodes = [
    { x: 20, y: 30 },
    { x: 50, y: 20 },
    { x: 80, y: 40 },
    { x: 30, y: 70 },
    { x: 70, y: 80 },
    { x: 90, y: 60 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <svg className="w-full h-full">
        {/* Connection lines */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((targetNode, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke="#FE3F5E"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))
        )}
        
        {/* Network nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="4"
            fill="#FFD200"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
}