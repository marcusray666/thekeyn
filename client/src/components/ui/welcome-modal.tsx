import { useState } from "react";
import { Shield, Sparkles, Lock, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export function WelcomeModal({ isOpen, onClose, username }: WelcomeModalProps) {
  if (!isOpen) return null;

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
              <h1 className="text-4xl font-bold gradient-text mb-4">Loggin'</h1>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome{username ? `, ${username}` : ''}!
              </h2>
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
              <Button
                onClick={onClose}
                className="btn-glass px-8 py-3 rounded-2xl font-semibold text-white"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Let's Get Started
              </Button>
              
              <p className="text-gray-500 text-sm mt-4">
                Ready to protect your creative works with blockchain certificates
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