import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TopNav } from "@/components/premium/top-nav";
import { BottomNav } from "@/components/premium/bottom-nav";
import { PostCard } from "@/components/premium/post-card";
import { Plus, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "wouter";

export default function PremiumHome() {

  // Fetch user's protected works to display as feed
  const { data: works = [], isLoading } = useQuery({
    queryKey: ["/api/works"],
    queryFn: () => apiRequest("/api/works"),
  });

  // Mock community posts for feed
  const communityPosts = [
    {
      id: 1,
      title: "Digital Art Collection #1",
      filename: "abstract_art.jpg",
      creatorName: "CreativePro",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sha256Hash: "a1b2c3d4e5f6789012345678901234567890abcdef",
      mimeType: "image/jpeg",
      isVerified: true,
      likesCount: 42,
      commentsCount: 8
    },
    {
      id: 2,
      title: "Original Music Track",
      filename: "beat_drop.mp3",
      creatorName: "SoundMaster",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sha256Hash: "b2c3d4e5f6789012345678901234567890abcdef1",
      mimeType: "audio/mpeg",
      isVerified: true,
      likesCount: 156,
      commentsCount: 23
    }
  ];

  const allPosts = [
    ...works.map(work => ({
      ...work,
      likesCount: Math.floor(Math.random() * 100),
      commentsCount: Math.floor(Math.random() * 20)
    })),
    ...communityPosts
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-20 md:pb-0">
      
      <main className="pt-24">
        {/* Stories Section */}
        <div className="px-6 mb-8">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            <Link href="/upload">
              <div className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white/70">Upload</span>
              </div>
            </Link>
            
            <div className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-0.5">
                <div className="w-full h-full bg-[#0F0F0F] rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-white/70">Trending</span>
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full p-0.5">
                <div className="w-full h-full bg-[#0F0F0F] rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-white/70">Recent</span>
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5">
                <div className="w-full h-full bg-[#0F0F0F] rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-white/70">Community</span>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="px-6 space-y-8">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="post-card animate-pulse">
                  <div className="h-16 bg-white/10 rounded-xl mb-4"></div>
                  <div className="h-24 bg-white/10 rounded-xl mb-4"></div>
                  <div className="h-8 bg-white/10 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : allPosts.length > 0 ? (
            allPosts.map((post) => (
              <PostCard
                key={`${post.id}-${post.creatorName || 'user'}`}
                post={post}
                onDetailsClick={() => {
                  // Open post details modal
                  console.log('Open details for:', post);
                }}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Plus className="h-12 w-12 text-white/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start Your Journey</h3>
              <p className="text-white/50 mb-6 max-w-sm mx-auto">
                Upload your first digital work to protect it on the blockchain and join our creator community.
              </p>
              <Link href="/upload">
                <button className="accent-button">
                  <Plus className="h-5 w-5 mr-2" />
                  Protect Your First Work
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/upload">
        <button className="floating-action">
          <Plus className="h-8 w-8" />
        </button>
      </Link>

      <BottomNav />
    </div>
  );
}