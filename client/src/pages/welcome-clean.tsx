import { Link } from "wouter";
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

        {/* CTA Buttons - iOS Safari Compatible */}
        <div className="flex flex-col gap-4 justify-center items-center mb-16 px-6 w-full max-w-xs mx-auto">
          <a href="/register" className="w-full block no-underline" style={{ textDecoration: 'none' }}>
            <div 
              className="w-full text-white text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center cursor-pointer select-none" 
              style={{ 
                backgroundColor: '#FE3F5E',
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
              <Crown className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff', fontWeight: '600' }}>Get Started</span>
            </div>
          </a>
          
          <a href="/login" className="w-full block no-underline" style={{ textDecoration: 'none' }}>
            <div 
              className="w-full text-gray-800 text-base font-semibold px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center cursor-pointer select-none" 
              style={{ 
                backgroundColor: '#ffffff',
                color: '#1f2937',
                textDecoration: 'none',
                userSelect: 'none',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                border: '2px solid #1f2937',
                outline: 'none',
                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <span style={{ color: '#1f2937', fontWeight: '600' }}>Loggin</span>
            </div>
          </a>
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