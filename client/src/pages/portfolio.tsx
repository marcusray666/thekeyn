import { useAuth } from "@/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { AnimatedShowcase } from "@/components/portfolio/animated-showcase";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { User, Work } from "@shared/schema";
import { Loader2 } from "lucide-react";

// Dedicated Portfolio Page - Shows only the portfolio showcase
export default function Portfolio() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'carousel' | 'timeline'>('grid');

  // If no username in URL and user is logged in, redirect to their portfolio
  if (!username && currentUser?.username) {
    setLocation(`/portfolio/${currentUser.username}`);
    return null;
  }

  // Fetch user profile (using same endpoint as profile page)
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profile', username],
    enabled: !!username,
  });

  // Fetch user's works (using same endpoint as profile page)
  const { data: works = [], isLoading: isLoadingWorks } = useQuery({
    queryKey: [`/api/users/${profile?.id}/works`],
    enabled: !!profile?.id,
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="text-lg text-gray-300">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400">The requested user portfolio could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Portfolio Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            {profile.displayName || profile.username}'s Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            {works.length} {works.length === 1 ? 'work' : 'works'} • Creative showcase
          </p>
        </div>

        {/* Portfolio Showcase */}
        <div className="space-y-6">
          {isLoadingWorks ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <span className="text-gray-300">Loading works...</span>
              </div>
            </div>
          ) : (
            <AnimatedShowcase
              works={works.map((work: any) => ({
                ...work,
                fileType: work.mimeType?.split('/')[0] || 'file',
                likes: work.likes || 0,
                views: work.views || 0
              }))}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              autoplay={false}
              interactive={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}