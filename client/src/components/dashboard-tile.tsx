import { Link } from "wouter";
import { GlassCard } from "./glass-card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardTileProps {
  title: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
  description?: string;
  delay?: number;
}

export function DashboardTile({ 
  title, 
  icon: Icon, 
  route, 
  gradient,
  description,
  delay = 0
}: DashboardTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <Link href={route}>
        <GlassCard hover clickable className="h-full group">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {description}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}