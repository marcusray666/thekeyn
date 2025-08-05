import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Calendar, Image, Search, Download, ExternalLink, Shield, Award, Eye, Hash, Share2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { WorkImage } from "@/components/WorkImage";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: number;
  workId: number;
  certificateId: string;
  shareableLink: string;
  qrCode: string;
  createdAt: string;
  work: {
    id: number;
    title: string;
    description: string;
    creatorName: string;
    originalName: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    fileHash: string;
    blockchainHash: string;
    createdAt: string;
  };
}

export default function MyCertificates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["/api/certificates"],
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const filteredCertificates = certificates?.filter((cert: Certificate) =>
    cert.work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.work.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      // Extract blockchain anchor hash from verification proof
      let blockchainAnchorHash = certificate.work.blockchainHash;
      
      if (certificate.verificationProof) {
        try {
          const proof = JSON.parse(certificate.verificationProof);
          // Use blockchainAnchor if available, otherwise fallback to current value
          if (proof.blockchainAnchor && proof.blockchainAnchor !== certificate.work.fileHash) {
            blockchainAnchorHash = proof.blockchainAnchor;
          }
        } catch (parseError) {
          console.log('Could not parse verification proof, using existing blockchain hash');
        }
      }
      
      const { generateCertificatePDF } = await import('@/lib/certificateGenerator');
      await generateCertificatePDF({
        certificateId: certificate.certificateId,
        title: certificate.work.title,
        description: certificate.work.description || '',
        creatorName: certificate.work.creatorName,
        originalName: certificate.work.originalName,
        mimeType: certificate.work.mimeType,
        fileSize: certificate.work.fileSize,
        fileHash: certificate.work.fileHash,
        blockchainHash: blockchainAnchorHash,
        createdAt: certificate.work.createdAt,
        shareableLink: certificate.shareableLink,
      });
      
      toast({
        title: "Certificate downloaded!",
        description: `PDF certificate for "${certificate.work.title}" has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to generate certificate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LiquidGlassLoader size="xl" text="Loading your certificates..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Certificates</h1>
          <p className="text-gray-400">Manage and view all your registered creative works</p>
        </div>

        {/* Search and Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLocation('/studio')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Work
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Certificates Grid - Studio Style */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'No certificates match your search.' : 'Upload your first work to get started!'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setLocation('/studio')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload First Work
              </Button>
            )}
          </GlassCard>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate: Certificate) => (
              <GlassCard key={certificate.id} className="p-6 hover:shadow-lg transition-all duration-200">
                {/* Certificate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{certificate.work.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {certificate.work.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400 font-medium">Certified</span>
                  </div>
                </div>
                
                {/* Image Preview */}
                <div className="relative mb-4 group">
                  <img
                    src={`/api/files/${certificate.work.filename}`}
                    alt={certificate.work.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" className="bg-black/50 text-white border-none hover:bg-black/70">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white">{formatDate(certificate.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white capitalize">
                      {certificate.work.mimeType.includes('image') ? 'Image' : 
                       certificate.work.mimeType.includes('video') ? 'Video' : 'Document'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Blockchain</span>
                    <span className="text-green-400">Verified</span>
                  </div>
                </div>
                
                {/* Certificate ID */}
                <div className="bg-purple-600/20 px-3 py-2 rounded-lg text-xs text-purple-300 font-mono mb-4">
                  {certificate.certificateId}
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setLocation(`/certificate/${certificate.certificateId}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => handleDownloadCertificate(certificate)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setLocation(`/certificate/${certificate.certificateId}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.work.fileHash);
                      toast({
                        title: "Copied!",
                        description: "File hash copied to clipboard",
                      });
                    }}
                  >
                    <Hash className="h-4 w-4" />
                    Copy Hash
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.shareableLink);
                      toast({
                        title: "Copied!",
                        description: "Share link copied to clipboard",
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Stats */}
        {certificates && certificates.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="text-center py-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {certificates.length}
              </div>
              <div className="text-gray-400">Total Certificates</div>
            </GlassCard>
            
            <GlassCard className="text-center py-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {new Set(certificates.map((cert: Certificate) => cert.work.mimeType.split('/')[0])).size}
              </div>
              <div className="text-gray-400">Content Types</div>
            </GlassCard>
            
            <GlassCard className="text-center py-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {certificates.filter((cert: Certificate) => 
                  new Date(cert.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-gray-400">This Month</div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}