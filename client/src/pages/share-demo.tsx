import { useState } from "react";
import { UrlPreview } from "@/components/premium/url-preview";
import { ShareModal } from "@/components/premium/share-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Link2 } from "lucide-react";

export default function ShareDemo() {
  const [testUrl, setTestUrl] = useState("http://localhost:5000/certificates/1");
  const [showShareModal, setShowShareModal] = useState(false);

  const sampleContent = {
    id: 1,
    title: "Digital Art Masterpiece",
    type: 'work' as const,
    creatorName: "Artist Name",
    creatorId: 1,
    thumbnailUrl: undefined,
    isProtected: true,
    filename: "artwork.jpg",
    description: "A beautiful digital art piece protected on the blockchain"
  };

  const testUrls = [
    "http://localhost:5000/certificates/1",
    "http://localhost:5000/works/2", 
    "http://localhost:5000/posts/3"
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden pt-24 pb-20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Share & Preview Demo</h1>
          <p className="text-white/70">Test one-click sharing and smart URL previews</p>
        </div>

        {/* Share Modal Demo */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-[#FE3F5E]" />
            Share Modal Demo
          </h2>
          <p className="text-white/70 mb-4">
            Test the comprehensive sharing functionality with social media, direct links, and smart previews.
          </p>
          <Button
            onClick={() => setShowShareModal(true)}
            className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Open Share Modal
          </Button>
        </div>

        {/* URL Preview Demo */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Link2 className="h-5 w-5 mr-2 text-[#FE3F5E]" />
            Smart URL Previews
          </h2>
          <p className="text-white/70 mb-4">
            Enter a URL to see the smart preview functionality that generates rich previews for shared content.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex space-x-2">
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter URL to preview..."
                className="flex-1 bg-black/20 border-white/10 text-white placeholder:text-white/50"
              />
              <Button
                onClick={() => setTestUrl(testUrl)}
                variant="outline"
                className="bg-black/20 border-white/10 text-white hover:bg-white/10"
              >
                Preview
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {testUrls.map((url, index) => (
                <Button
                  key={index}
                  onClick={() => setTestUrl(url)}
                  variant="outline"
                  size="sm"
                  className="bg-black/10 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Test URL {index + 1}
                </Button>
              ))}
            </div>
          </div>

          {/* URL Preview Display */}
          {testUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Preview Result:</h3>
              <UrlPreview url={testUrl} />
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Sharing Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Share Modal Features</h3>
              <ul className="text-white/70 space-y-1 text-sm">
                <li>• Multiple social media platforms</li>
                <li>• Custom message support</li>
                <li>• Smart preview generation</li>
                <li>• Direct messaging integration</li>
                <li>• Copy to clipboard functionality</li>
                <li>• Email sharing support</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">URL Preview Features</h3>
              <ul className="text-white/70 space-y-1 text-sm">
                <li>• Rich content metadata</li>
                <li>• Creator information display</li>
                <li>• Protection status indicators</li>
                <li>• View/like/share statistics</li>
                <li>• Thumbnail/icon generation</li>
                <li>• Click-to-open functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={sampleContent}
        />
      )}
    </div>
  );
}