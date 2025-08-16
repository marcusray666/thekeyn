import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, Crown } from "lucide-react";
// LogoIcon component will be replaced with simple text

export default function WelcomeClean() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-5 light-theme overflow-x-hidden">
      {/* Content */}
      <div className="w-full max-w-4xl mx-auto text-center safe-area-inset">
        {/* Hero Section */}
        <div className="mb-12">
          <Badge className="mb-6 bg-white/60 backdrop-blur-md border-gray-200/50 text-gray-700 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Digital Art Protection Platform
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-gray-800 px-2">
            Protect Your Creative Work
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Instantly secure, prove, and defend your digital creations with blockchain-powered certificates. Join thousands of creators protecting their intellectual property.
          </p>
        </div>

        {/* CTA Buttons - Fixed for Mobile */}
        <div className="flex flex-col gap-4 justify-center items-center mb-16 px-4 w-full max-w-md mx-auto">
          <Link href="/register" className="w-full">
            <Button 
              size="lg" 
              className="w-full bg-[#FE3F5E] hover:bg-[#FE3F5E]/90 text-white text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 min-h-[56px]"
            >
              <Crown className="h-6 w-6 mr-3" />
              Get Started
            </Button>
          </Link>
          
          <Link href="/login" className="w-full">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-2 border-gray-400 bg-white/80 text-gray-800 hover:bg-gray-50 text-lg px-8 py-4 rounded-2xl backdrop-blur-sm min-h-[56px] shadow-lg"
            >
              Loggin'
            </Button>
          </Link>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-[#FE3F5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#FE3F5E]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Protection</h3>
            <p className="text-gray-600">
              Upload your work and get blockchain-verified certificates within seconds.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-[#FFD200]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-[#FFD200]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI Powered</h3>
            <p className="text-gray-600">
              Advanced AI ensures your content meets platform guidelines automatically.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-[#FE3F5E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-[#FE3F5E]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Global Recognition</h3>
            <p className="text-gray-600">
              Certificates recognized worldwide with immutable blockchain proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}