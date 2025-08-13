import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Zap, 
  Crown, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";

export default function Welcome() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const floatAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden light-theme">
      {/* Subtle Background with Pink/Yellow Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-yellow-50/20 to-pink-50/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FE3F5E]/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD200]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FE3F5E]/3 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-20"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="mb-8">
              <Badge className="mb-4 bg-white/60 backdrop-blur-md border-gray-200/50 text-gray-700 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Digital Art Protection Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-urbanist font-bold mb-6">
                <span className="text-gray-800">
                  Protect Your Creative
                </span>
                <br />
                <span className="text-gray-800">
                  Work
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Instantly secure, prove, and defend your digital creations with blockchain-powered certificates. Join thousands of creators protecting their intellectual property.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-[#FE3F5E] hover:bg-[#FE3F5E]/90 text-white text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 group"
                >
                  Sign up to start protecting your work
                </Button>
              </Link>
              
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-[#FFD200] hover:bg-[#FFD200]/90 border-[#FFD200] text-gray-800 hover:text-gray-900 text-lg px-8 py-4 rounded-2xl group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogoIcon className="h-6 w-6 mr-3" />
                  Loggin'
                </Button>
              </Link>
            </motion.div>

            {/* Bottom Section */}
            <motion.div variants={itemVariants} className="mt-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Everything You Need to Protect Your Art
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Professional-grade protection tools trusted by creators worldwide
              </p>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {/* Protect Now Card */}
            <motion.div variants={itemVariants} className="p-8 text-center group">
              <motion.div
                animate={floatAnimation}
                className="w-20 h-20 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-violet-500/25 transition-shadow"
              >
                <Shield className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Protection</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Upload your work and get blockchain-verified certificates within seconds. Military-grade security meets creator convenience.
              </p>
              <Link href="/upload">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                  Start Protecting
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* See How It Works Card */}
            <motion.div variants={itemVariants} className="p-8 text-center group">
              <motion.div
                animate={{...floatAnimation, transition: {...floatAnimation.transition, delay: 0.5}}}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-emerald-500/25 transition-shadow"
              >
                <Zap className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Dual Blockchain</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your work is anchored to both Ethereum and Bitcoin blockchains, creating an immutable record that lasts forever.
              </p>
              <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                Learn More
                <Play className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>

            {/* View Example Card */}
            <motion.div variants={itemVariants} className="p-8 text-center group">
              <motion.div
                animate={{...floatAnimation, transition: {...floatAnimation.transition, delay: 1}}}
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-amber-500/25 transition-shadow"
              >
                <Eye className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Live Examples</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                See real certificates from creators worldwide. Explore the future of digital ownership protection.
              </p>
              <Link href="/certificates">
                <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  View Gallery
                  <Eye className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-20"
          >
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <motion.div animate={pulseAnimation} className="text-4xl md:text-5xl font-bold text-violet-400 mb-2">
                  10K+
                </motion.div>
                <p className="text-gray-400">Works Protected</p>
              </div>
              <div className="text-center">
                <motion.div animate={pulseAnimation} className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                  $2.5M+
                </motion.div>
                <p className="text-gray-400">IP Value Secured</p>
              </div>
              <div className="text-center">
                <motion.div animate={pulseAnimation} className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  50K+
                </motion.div>
                <p className="text-gray-400">Blockchain Anchors</p>
              </div>
              <div className="text-center">
                <motion.div animate={pulseAnimation} className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                  99.9%
                </motion.div>
                <p className="text-gray-400">Success Rate</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join the Creator Revolution?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start protecting your creative works today with the world's most trusted blockchain platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 to-emerald-500 hover:from-violet-700 hover:to-emerald-600 text-white text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
                >
                  <Crown className="h-6 w-6 mr-3" />
                  Start Your Empire
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/5 text-lg px-8 py-4 rounded-2xl backdrop-blur-sm"
                >
                  <LogoIcon className="h-6 w-6 mr-3" />
                  Loggin'
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}