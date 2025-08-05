import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SidebarNav } from "@/components/sidebar-nav";
import { PageWrapper } from "@/components/page-wrapper";
import { GlassCard } from "@/components/glass-card";
import { DashboardTile } from "@/components/dashboard-tile";
import { Shield, Users, FileText, CheckCircle, TrendingUp, Heart, Award, Clock } from "lucide-react";

const dashboardTiles = [
  { 
    title: "Protect Work", 
    icon: Shield, 
    route: "/protect",
    gradient: "bg-gradient-to-br from-[#9146FF] to-[#7C3AED]",
    description: "Secure your creative content"
  },
  { 
    title: "Community", 
    icon: Users, 
    route: "/feed",
    gradient: "bg-gradient-to-br from-[#10B981] to-[#059669]",
    description: "Connect with creators"
  },
  { 
    title: "Certificates", 
    icon: FileText, 
    route: "/studio?tab=certificates",
    gradient: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
    description: "View your proofs"
  },
  { 
    title: "Verify", 
    icon: CheckCircle, 
    route: "/verify",
    gradient: "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
    description: "Check authenticity"
  },
];

export default function DashboardCleanNew() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: () => apiRequest("/api/user/stats"),
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/user/activity"],
    queryFn: () => apiRequest("/api/user/activity"),
  });

  return (
    <>
      <SidebarNav />
      <PageWrapper>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold text-white">
              Welcome back, {(user as any)?.username || "Creator"}!
            </h1>
            <p className="text-xl text-gray-300">
              Ready to secure your next masterpiece?
            </p>
          </motion.div>

          {/* Main Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardTiles.map((tile, index) => (
              <DashboardTile
                key={tile.title}
                {...tile}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <GlassCard>
              <h3 className="text-2xl font-bold text-white mb-6">Your Digital Empire</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9146FF] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.worksProtected || 12}</div>
                  <div className="text-gray-400">Works Protected</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.certificates || 8}</div>
                  <div className="text-gray-400">Certificates</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.communityLikes || 156}</div>
                  <div className="text-gray-400">Community Likes</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.followers || 42}</div>
                  <div className="text-gray-400">Followers</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity & Community Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <GlassCard>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-[#9146FF]" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {(recentActivity || [
                    { type: "protect", title: "Protected 'Digital Art Piece #1'", time: "2 hours ago", icon: Shield },
                    { type: "certificate", title: "Downloaded certificate #ABC123", time: "1 day ago", icon: FileText },
                    { type: "community", title: "Shared post about IP protection", time: "3 days ago", icon: Users },
                  ]).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#9146FF]/20 to-[#7C3AED]/20 rounded-lg flex items-center justify-center">
                        <activity.icon className="h-5 w-5 text-[#9146FF]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <GlassCard>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#10B981]" />
                  Community Highlights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">New post from @creativepro</p>
                      <p className="text-gray-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#F59E0B]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">127 new works protected today</p>
                      <p className="text-gray-400 text-xs">Today</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#EF4444]/20 to-[#DC2626]/20 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-[#EF4444]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Community milestone: 10,000 creators</p>
                      <p className="text-gray-400 text-xs">2 days ago</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}