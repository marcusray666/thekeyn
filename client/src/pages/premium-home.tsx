import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommunityPostCard } from "@/components/premium/community-post-card";
import { Plus, MessageCircle, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "wouter";


export default function PremiumHome() {
  // Get current user data
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
    retry: false,
  });

  // Fetch community posts (real data from API)
  const { data: communityPosts = [], isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
    queryFn: () => apiRequest("/api/community/posts"),
  });

  // Use real API data only

  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-20 md:pb-0 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <main className="pt-8 relative z-10">
        {/* Stories Section */}
        <div className="px-6 mb-4">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {/* Upload button removed - now available in top navigation */}
          </div>
        </div>

        {/* Feed */}
        <div className="px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
                </div>
                <p className="text-white/60 text-sm">Loading your feed...</p>
              </div>
            </div>
          ) : communityPosts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">Welcome to the Community</h3>
                <p className="text-white/60 text-sm mb-4">Be the first to share your creative work!</p>
                <Link href="/create-post">
                  <button className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">
                    Create Your First Post
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {communityPosts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>
          )}
          

        </div>
      </main>



    </div>
  );
}