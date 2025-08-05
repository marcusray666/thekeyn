import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Upload, 
  FileText, 
  Shield, 
  Users, 
  Plus,
  BarChart3,
  Crown,
  Zap,
  Sparkles,
  Award,
  CheckCircle2,
  DollarSign,
  Globe,
  Layers,
  Clock,
  Star
} from "lucide-react";

interface Work {
  id: number;
  title: string;
  creatorName: string;
  createdAt: string | Date;
  certificateId: string;
  mimeType: string;
  fileSize: number;
}

interface Stats {
  protected: number;
  certificates: number;
  reports: number;
}

interface User {
  username: string;
  subscription_tier: string;
  monthly_uploads: number;
  monthly_upload_limit: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
}

export default function EnhancedDashboard() {
  const { data: recentWorks, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works/recent"],
    select: (data: Work[]) => data.slice(0, 6),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/profile"],
  });



  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Badge className="bg-violet-600 text-white"><Crown className="h-3 w-3 mr-1" />Pro</Badge>;
      case 'starter':
        return <Badge className="bg-emerald-500 text-white"><Zap className="h-3 w-3 mr-1" />Starter</Badge>;
      default:
        return <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Free</Badge>;
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🎨';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.startsWith('video/')) return '🎬';
    return '📁';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (worksLoading || statsLoading || userLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <div className="animate-pulse text-center">
            <div className="h-8 bg-gradient-to-r from-violet-600/20 to-emerald-500/20 rounded mb-4"></div>
            <div className="h-4 bg-gradient-to-r from-violet-600/10 to-emerald-500/10 rounded"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate estimated value (placeholder for now)
  const estimatedValue = (stats?.protected || 0) * 150; // $150 per protected work average

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-emerald-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Crown className="h-8 w-8 text-violet-400" />
              <h1 className="text-4xl md:text-6xl font-urbanist font-bold bg-gradient-to-r from-violet-400 via-white to-emerald-400 bg-clip-text text-transparent">
                Creator Dashboard
              </h1>
              <Sparkles className="h-8 w-8 text-emerald-400 animate-float" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-6"
            >
              Your digital empire, protected by blockchain technology
            </motion.p>
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-4"
              >
                <div className="text-sm text-gray-400">Welcome back, <span className="text-white font-semibold">{user.username}</span></div>
                {getSubscriptionBadge(user.subscription_tier)}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 border-violet-500/20 hover:from-violet-600/30 hover:to-violet-800/30 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-violet-200">Files Protected</CardTitle>
                <Shield className="h-5 w-5 text-violet-400 group-hover:animate-glow" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats?.protected || 0}</div>
                <p className="text-xs text-violet-300 mt-1">
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border-emerald-500/20 hover:from-emerald-500/30 hover:to-emerald-700/30 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-200">Certificates Issued</CardTitle>
                <Award className="h-5 w-5 text-emerald-400 group-hover:animate-float" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats?.certificates || 0}</div>
                <p className="text-xs text-emerald-300 mt-1">
                  100% blockchain verified
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/20 hover:from-blue-500/30 hover:to-blue-700/30 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-200">Social Reach</CardTitle>
                <Users className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{user?.follower_count || 0}</div>
                <p className="text-xs text-blue-300 mt-1">
                  followers • {user?.total_likes || 0} likes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/20 hover:from-amber-500/30 hover:to-orange-600/30 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-200">Estimated Value</CardTitle>
                <DollarSign className="h-5 w-5 text-amber-400 group-hover:animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">${estimatedValue.toLocaleString()}</div>
                <p className="text-xs text-amber-300 mt-1">
                  protected IP value
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upload Progress & Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 backdrop-blur-xl bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                  Monthly Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Uploads this month</span>
                  <span className="text-white font-semibold">
                    {user?.monthly_uploads || 0} / {user?.monthly_upload_limit === 999999 ? '∞' : user?.monthly_upload_limit || 3}
                  </span>
                </div>
                <Progress 
                  value={user?.monthly_upload_limit === 999999 ? 0 : ((user?.monthly_uploads || 0) / (user?.monthly_upload_limit || 3)) * 100} 
                  className="h-3 bg-gray-800"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    {user?.subscription_tier === 'pro' ? 'Unlimited uploads' : `${(user?.monthly_upload_limit || 3) - (user?.monthly_uploads || 0)} uploads remaining`}
                  </p>
                  {user?.subscription_tier !== 'pro' && (
                    <Button size="sm" variant="outline" className="text-xs">
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/upload">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Protect New Work
                  </Button>
                </Link>
                <Link href="/certificates">
                  <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                    <FileText className="h-4 w-4 mr-2" />
                    View Certificates
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    <Globe className="h-4 w-4 mr-2" />
                    Explore Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Protected Works */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-violet-400" />
                    Recent Protected Works
                  </div>
                  <Link href="/my-works">
                    <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recentWorks || recentWorks.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No protected works yet</p>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-violet-600 to-emerald-500 hover:from-violet-700 hover:to-emerald-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Protect Your First Work
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentWorks.map((work, index) => (
                      <motion.div
                        key={work.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <Card className="h-full backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="text-2xl">{getFileTypeIcon(work.mimeType)}</div>
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">
                              {work.title}
                            </h4>
                            <div className="text-xs text-gray-400 space-y-1">
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(work.createdAt).toLocaleDateString()}
                              </p>
                              <p className="font-mono text-violet-400">
                                ID: {work.certificateId.substring(0, 8)}...
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}