import { Link } from "wouter";
import { Shield, Upload, Link as LinkIcon, Gavel, Plus, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  const features = [
    {
      icon: Upload,
      title: "Upload Instantly",
      description: "Upload your art, music, or designs and create a digital certificate within seconds.",
      variant: "purple" as const,
    },
    {
      icon: LinkIcon,
      title: "Blockchain Proof",
      description: "Every work is timestamped and anchored to the blockchain for permanent verification.",
      variant: "blue" as const,
    },
    {
      icon: Shield,
      title: "Share Everywhere",
      description: "Share certificates as PDF, QR code, or secure link for legal protection.",
      variant: "cyan" as const,
    },
    {
      icon: Gavel,
      title: "Enforce Rights",
      description: "Generate takedown notices for platforms like Instagram, YouTube, and TikTok.",
      variant: "emerald" as const,
    },
  ];

  const glassCardStyle = {
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  };

  return (
    <div className="pt-24 min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
      color: 'white'
    }}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl bg-white/10 p-8 md:p-12 mb-8 hover:translate-y-[-4px] transition-transform duration-300" 
               style={glassCardStyle}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Protect. Create.</span><br/>
              <span className="text-white">Own Your Art.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Instantly secure, prove, and defend your creative work with blockchain-powered certificates. 
              Right from your phone or browser.
            </p>
            
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/login">
                <Button className="btn-glass px-8 py-4 rounded-2xl font-semibold text-white text-lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="glass-morphism px-8 py-4 rounded-2xl font-semibold text-white text-lg hover:bg-opacity-80 transition-all"
                >
                  <User className="mr-2 h-5 w-5" />
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            How Loggin Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-xl border rounded-2xl shadow-2xl bg-white/10 backdrop-saturate-150 border-white/20 hover:translate-y-[-4px] transition-transform duration-300 p-6 text-center"
                style={glassCardStyle}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  feature.variant === 'purple' ? 'from-purple-500 to-purple-600' :
                  feature.variant === 'blue' ? 'from-blue-500 to-blue-600' :
                  feature.variant === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                  'from-emerald-500 to-emerald-600'
                } flex items-center justify-center mb-4 mx-auto`}>
                  <feature.icon className="text-2xl text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl bg-white/10 p-8 md:p-12" 
               style={glassCardStyle}>
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Ready to Protect</span><br/>
              <span className="text-white">Your Creative Work?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust Loggin' to secure their digital assets with blockchain technology.
            </p>
            
            <div className="flex justify-center items-center mb-8">
              <Link href="/register">
                <Button className="btn-glass px-8 py-4 rounded-2xl font-semibold text-white text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Works Everywhere</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}