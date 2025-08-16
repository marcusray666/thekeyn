import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommunityPostCard } from "@/components/premium/community-post-card";
import { Plus, Users, Sparkles, Zap, Crown, CheckCircle2, Palette } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { OnboardingManager, ONBOARDING_FLOWS } from "@/components/onboarding/onboarding-manager";
import { useOnboardingTriggers } from "@/hooks/use-onboarding";
import { SimpleBackgroundEngine } from "@/components/SimpleBackgroundEngine";
import { BackgroundPreferencesPanel } from "@/components/BackgroundPreferencesPanel";
import React from "react";


export default function PremiumHome() {
  const { triggerDashboardFlow } = useOnboardingTriggers();
  
  // Get current user data
  const { data: currentUser, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
    retry: false,
  });

  // Fetch community posts (real data from API) - always call hooks at top level
  const { data: communityPosts = [], isLoading, error } = useQuery({
    queryKey: ["/api/community/posts"],
    queryFn: async () => {
      const response = await fetch("/api/community/posts", {
        credentials: "include", // Include session cookies
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!currentUser, // Only fetch when user is authenticated
    retry: 1,
  });

  // Trigger dashboard onboarding for authenticated users
  React.useEffect(() => {
    if (currentUser && !authLoading) {
      triggerDashboardFlow();
    }
  }, [currentUser, authLoading, triggerDashboardFlow]);

  // Debug logging
  console.log("PremiumHome - currentUser:", currentUser);
  console.log("PremiumHome - communityPosts:", communityPosts);
  console.log("PremiumHome - isLoading:", isLoading);
  console.log("PremiumHome - error:", error);

  // Show welcome page for unauthenticated users
  if (!authLoading && !currentUser) {
    return <WelcomePage />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 light-theme">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Use real API data only

  return (
    <SimpleBackgroundEngine className="min-h-screen pb-24 md:pb-0 relative overflow-hidden light-theme">
      {/* Background Settings Button */}
      <div className="fixed top-20 right-6 z-50">
        <BackgroundPreferencesPanel 
          trigger={
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/90 backdrop-blur-xl border-gray-200/50 hover:bg-white shadow-lg"
            >
              <Palette className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      
      <main className="pt-24 relative z-30">
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
                <p className="text-gray-600 text-sm">Loading your feed...</p>
              </div>
            </div>
          ) : communityPosts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-gray-800 font-semibold text-xl mb-2">Welcome to the Community</h3>
                <p className="text-gray-600 text-sm mb-4">Be the first to share your creative work!</p>
                <Link href="/create-post">
                  <button className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">
                    Create Your First Post
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {communityPosts.map((post: any) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  isAdmin={currentUser?.role === 'admin'}
                />
              ))}
            </div>
          )}
          

        </div>
      </main>

      {/* Onboarding Manager */}
      <OnboardingManager
        steps={ONBOARDING_FLOWS.DASHBOARD}
        tourId="DASHBOARD"
        autoStart={false}
      />
    </SimpleBackgroundEngine>
  );
}

// Welcome page component for unauthenticated users
function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FE3F5E]/3 rounded-full blur-[120px]"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-4">
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              TheKeyn
            </h1>
            
            <div className="mb-6 inline-flex items-center px-4 py-2 text-[#FFD200] text-sm font-medium" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
              border: 'none',
              boxShadow: 'none',
              outline: 'none'
            }}>
              <Sparkles className="h-4 w-4 mr-2" />
              Digital Art Protection Platform
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Protect Your
              <span className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] bg-clip-text text-transparent"> Creative Work</span>
            </h2>
            
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Instantly secure, prove, and defend your digital creations with blockchain-powered certificates. 
              Join thousands of creators protecting their intellectual property.
            </p>

            <div className="flex flex-col gap-4 justify-center items-center px-6 w-full max-w-xs mx-auto">
              <a href="/register" className="w-full block no-underline" style={{ textDecoration: 'none' }}>
                <div 
                  className="w-full text-white text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center cursor-pointer select-none" 
                  style={{ 
                    background: 'linear-gradient(to right, #FE3F5E, #FF6B8A)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    userSelect: 'none',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: '0 4px 12px -2px rgba(254, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>Get Started for Free</span>
                </div>
              </a>
              <a href="/login" className="w-full block no-underline" style={{ textDecoration: 'none' }}>
                <div 
                  className="w-full text-white text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center cursor-pointer select-none" 
                  style={{ 
                    background: 'linear-gradient(to right, #FE3F5E, #FFD200)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    userSelect: 'none',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: '0 4px 12px -2px rgba(254, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>Log In</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Everything You Need to Protect Your Art
            </h2>
            <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
              Professional-grade protection tools trusted by creators worldwide
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                backdropFilter: 'blur(4px)',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}>
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Blockchain Certificates</h3>
                <p className="text-white/60 mb-6">
                  Generate immutable blockchain certificates that prove ownership and creation timestamp of your work.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    Ethereum mainnet anchoring
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    Legal-grade certificates
                  </div>
                </div>
              </div>

              <div className="p-8" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                backdropFilter: 'blur(4px)',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}>
                <div className="w-12 h-12 bg-gradient-to-r from-[#FFD200] to-[#FFA500] rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Social Community</h3>
                <p className="text-white/60 mb-6">
                  Share your protected work with the community. Build your following and discover other creators.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    Community feed & interaction
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    Protected work sharing
                  </div>
                </div>
              </div>

              <div className="p-8" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                backdropFilter: 'blur(4px)',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}>
                <div className="w-12 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Tools</h3>
                <p className="text-white/60 mb-6">
                  Advanced content verification and smart recommendations to enhance your creative workflow.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    AI content verification
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#FFD200] mr-2" />
                    Smart content recommendations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-20" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'none',
          boxShadow: 'none',
          outline: 'none'
        }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              How TheKeyn Protects Your Work
            </h2>
            <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
              Three simple steps to secure your creative intellectual property forever
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Upload & Verify</h3>
                <p className="text-white/60 leading-relaxed">
                  Upload your artwork, music, writing, or any digital creation. Our AI instantly verifies and analyzes your content.
                </p>
              </div>
              
              <div className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FFD200] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Blockchain Protection</h3>
                <p className="text-white/60 leading-relaxed">
                  Your work gets timestamped and anchored to the Ethereum blockchain, creating permanent, immutable proof of ownership.
                </p>
              </div>
              
              <div className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Legal Certificate</h3>
                <p className="text-white/60 leading-relaxed">
                  Receive a professional PDF certificate with QR code that may serve as additional legal proof of your creative ownership.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Protect Your Creative Work?
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Join thousands of creators who trust TheKeyn with their most valuable digital assets.
            </p>
            <div className="flex justify-center">
              <a href="/register" className="block no-underline" style={{ textDecoration: 'none' }}>
                <div 
                  className="text-white text-lg font-semibold px-8 py-4 rounded-xl min-h-[52px] flex items-center justify-center cursor-pointer select-none" 
                  style={{ 
                    background: 'linear-gradient(to right, #FE3F5E, #FF6B8A)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    userSelect: 'none',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: '0 6px 16px -4px rgba(254, 63, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>Get Started for Free</span>
                  <Crown className="ml-2 h-5 w-5" style={{ color: '#ffffff' }} />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-white/60">
              © 2025 TheKeyn. Protecting creators' rights through blockchain technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}