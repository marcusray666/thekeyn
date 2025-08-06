import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommunityPostCard } from "@/components/premium/community-post-card";
import { Plus, Users, Shield, Sparkles, Zap, Crown, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";


export default function PremiumHome() {
  // Get current user data
  const { data: currentUser, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
    retry: false,
  });

  // Fetch community posts (real data from API) - always call hooks at top level
  const { data: communityPosts = [], isLoading, error } = useQuery({
    queryKey: ["/api/community/posts"],
    queryFn: () => apiRequest("/api/community/posts"),
    enabled: !!currentUser, // Only fetch when user is authenticated
    retry: 1,
  });

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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

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
        <header className="px-6 py-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl">Loggin'</span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-[#FFD200] text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Digital Art Protection Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Protect Your
              <span className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] bg-clip-text text-transparent"> Creative Work</span>
            </h1>
            
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Instantly secure, prove, and defend your digital creations with blockchain-powered certificates. 
              Join thousands of creators protecting their intellectual property.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-opacity">
                  Sign up to start protecting your work
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Sign In
                </Button>
              </Link>
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
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-white" />
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
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

        {/* Stats Section */}
        <section className="px-6 py-20 bg-white/5 border-y border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">25K+</div>
                <div className="text-white/60">Works Protected</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">5K+</div>
                <div className="text-white/60">Active Creators</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2M+</div>
                <div className="text-white/60">IP Value Protected</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-white/60">Uptime</div>
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
              Join thousands of creators who trust Loggin' with their most valuable digital assets.
            </p>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white px-12 py-4 text-xl font-semibold hover:opacity-90 transition-opacity">
                Get Started for Free
                <Crown className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Loggin'</span>
            </div>
            <p className="text-white/60">
              © 2025 Loggin'. Protecting creators' rights through blockchain technology.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}