import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TopNav } from "@/components/premium/top-nav";
import { BottomNav } from "@/components/premium/bottom-nav";
import { PostCard } from "@/components/premium/post-card";
import { Plus, MessageCircle, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "wouter";


export default function PremiumHome() {

  // Fetch user's protected works to display as feed
  const { data: works = [], isLoading } = useQuery({
    queryKey: ["/api/works"],
    queryFn: () => apiRequest("/api/works"),
  });

  // Community posts for feed (not showing user's certificates)
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
      commentsCount: 8,
      description: "Abstract digital artwork exploring color theory and emotion"
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
      commentsCount: 23,
      description: "Electronic beat with complex layering and unique drops"
    },
    {
      id: 3,
      title: "Photography Series: Urban Nights",
      filename: "urban_nights_01.jpg",
      creatorName: "NightLens",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sha256Hash: "c3d4e5f6789012345678901234567890abcdef12",
      mimeType: "image/jpeg",
      isVerified: true,
      likesCount: 89,
      commentsCount: 15,
      description: "Capturing the essence of city life after dark"
    },
    {
      id: 4,
      title: "3D Animation: Cosmic Journey",
      filename: "cosmic_journey.mp4",
      creatorName: "DigitalVoyager",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sha256Hash: "d4e5f6789012345678901234567890abcdef123",
      mimeType: "video/mp4",
      isVerified: true,
      likesCount: 234,
      commentsCount: 31,
      description: "3D animation exploring space and time through visual storytelling"
    },
    {
      id: 5,
      title: "Indie Folk Album",
      filename: "autumn_whispers.mp3",
      creatorName: "AcousticSoul",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sha256Hash: "e5f6789012345678901234567890abcdef1234",
      mimeType: "audio/mpeg",
      isVerified: true,
      likesCount: 178,
      commentsCount: 42,
      description: "Heartfelt indie folk songs about change and growth"
    }
  ];

  // Display only community posts in the main feed
  const allPosts = communityPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
            <Link href="/upload">
              <div className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white/70">Upload</span>
              </div>
            </Link>
            
            <Link href="/messages">
              <div className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-0.5">
                  <div className="w-full h-full bg-[#0F0F0F] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="text-xs text-white/70">Messages</span>
              </div>
            </Link>
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
          ) : (
            <div className="space-y-8">
              {allPosts.map((post) => (
                <PostCard
                  key={`${post.id}-${post.creatorName || 'user'}`}
                  post={post}
                  onDetailsClick={() => {
                    // Open post details modal
                    console.log('Open details for:', post);
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Show upload prompt after community posts */}
          <div className="mt-8 text-center py-12 bg-white/5 rounded-3xl">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center mb-6">
              <Plus className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Join the Community</h3>
            <p className="text-white/50 mb-6 max-w-sm mx-auto">
              Upload your digital work to protect it on the blockchain and share it with creators worldwide.
            </p>
            <Link href="/upload">
              <button className="accent-button">
                <Plus className="h-5 w-5 mr-2" />
                Protect Your Work
              </button>
            </Link>
          </div>
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