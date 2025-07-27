import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Upload, Users, Award, Crown, Activity, Plus, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function AuthenticatedHome() {
  const { user } = useAuth();

  // Get user's recent works and certificates
  const { data: userWorks = [] } = useQuery({
    queryKey: ['/api/works'],
    enabled: !!user,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['/api/certificates'],
    enabled: !!user,
  });

  const quickActions = [
    {
      title: "Upload New Work",
      description: "Protect your latest creation",
      icon: Upload,
      href: "/studio",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Browse Community",
      description: "Discover other creators",
      icon: Users,
      href: "/social",
      color: "from-green-500 to-teal-600"
    },
    {
      title: "View Certificates",
      description: "Manage your protections",
      icon: Award,
      href: "/certificates",
      color: "from-yellow-500 to-orange-600"
    },
    {
      title: "Verify Blockchain",
      description: "Advanced verification",
      icon: Shield,
      href: "/blockchain-verification",
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.displayName || user?.username}!
          </h1>
          <p className="text-xl text-gray-300">
            Ready to protect and showcase your creative work?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Protected Works</p>
                <p className="text-2xl font-bold text-white">{userWorks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Certificates</p>
                <p className="text-2xl font-bold text-white">{certificates.length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subscription</p>
                <p className="text-2xl font-bold text-white capitalize">{user?.subscriptionTier}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Uploads</p>
                <p className="text-2xl font-bold text-white">
                  {user?.monthlyUploads}/{user?.monthlyUploadLimit}
                </p>
              </div>
              <BarChart className="h-8 w-8 text-green-400" />
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <GlassCard className="p-6 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {userWorks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Works</h2>
              <Link href="/certificates">
                <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userWorks.slice(0, 3).map((work: any) => (
                <GlassCard key={work.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{work.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Protected {new Date(work.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/certificate/${work.certificateId}`}>
                      <Button size="sm" variant="outline">
                        View Certificate
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userWorks.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">No Protected Works Yet</h3>
            <p className="text-gray-400 mb-6">
              Start protecting your creative work today with blockchain-powered certificates.
            </p>
            <Link href="/studio">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Work
              </Button>
            </Link>
          </GlassCard>
        )}
      </div>
    </div>
  );
}