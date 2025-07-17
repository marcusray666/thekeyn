import { useState } from "react";
import { Shield, Sparkles, Lock, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  username?: string;
}

export function WelcomeModal({ isOpen, onClose, onStartTutorial, username }: WelcomeModalProps) {
  if (!isOpen) return null;

  const handleStartTutorial = () => {
    onClose();
    onStartTutorial();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="logo-glass w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">P</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to Prooff{username ? `, ${username}` : ''}!
              </h1>
              <p className="text-gray-400 text-lg">
                Your digital copyright protection platform is ready
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-900/30">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Instant Protection</h3>
                  <p className="text-gray-400 text-sm">
                    Upload your creative works and get blockchain-verified certificates in seconds
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-cyan-900/30">
                  <Lock className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Legal Protection</h3>
                  <p className="text-gray-400 text-sm">
                    Generate DMCA takedown notices and protect your rights automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-900/30">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Proof of Ownership</h3>
                  <p className="text-gray-400 text-sm">
                    Downloadable certificates with QR codes and blockchain verification
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-yellow-900/30">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Collaboration Ready</h3>
                  <p className="text-gray-400 text-sm">
                    Add collaborators to shared works for joint ownership protection
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                >
                  Explore on My Own
                </Button>
                
                <Button
                  onClick={handleStartTutorial}
                  className="btn-glass px-8 py-3 rounded-2xl font-semibold text-white"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Take the Tour
                </Button>
              </div>
              
              <p className="text-gray-500 text-sm mt-4">
                The interactive tutorial takes 2 minutes and shows you all the key features
              </p>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </>
  );
}