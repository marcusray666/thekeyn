import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Calendar, Image, Search, Download, ExternalLink, Shield, Award, Eye, Hash, Share2, Upload, CheckCircle, AlertCircle } from "lucide-react";
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
          console.log('Verification proof:', proof);
          
          // Check for different possible blockchain anchor fields
          if (proof.verificationHash && proof.verificationHash !== certificate.work.fileHash) {
            blockchainAnchorHash = proof.verificationHash;
          } else if (proof.blockchainAnchor && proof.blockchainAnchor !== certificate.work.fileHash) {
            blockchainAnchorHash = proof.blockchainAnchor;
          } else if (proof.blockHash) {
            blockchainAnchorHash = proof.blockHash;
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
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Certificates</h1>
            <p className="text-white/60 text-lg">Manage and view all your registered creative works</p>
          </div>
          <Button
            onClick={() => setLocation('/studio')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-semibold"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Work
          </Button>
        </div>

        {/* Search and Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 backdrop-blur-sm border-white/10 text-white placeholder-white/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLocation('/studio')}
                className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-4 py-2 rounded-xl border-0"
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
            <p className="text-white/60 mb-6">
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

        {/* Certificate Guide Section */}
        <div className="mt-16 border-t border-white/10 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Certificate Guide</h2>
            <p className="text-white/60 text-lg">Learn how to use your certificates for maximum protection</p>
          </div>

          {/* How to Use Your Certificate ID */}
          <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-white text-xl font-semibold mb-2">How to Use Your Certificate ID</h3>
              <p className="text-white/60">
                Your Certificate ID is proof of authenticity and ownership. Here's how to use it effectively:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-[#FE3F5E]/10 rounded-xl border border-[#FE3F5E]/20">
                  <Shield className="h-8 w-8 text-[#FE3F5E] mb-3" />
                  <h4 className="text-white font-semibold mb-2">Copyright Protection</h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• DMCA takedown notices</li>
                    <li>• Legal contract references</li>
                    <li>• Court evidence documentation</li>
                    <li>• Cease and desist letters</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-[#FFD200]/10 rounded-xl border border-[#FFD200]/20">
                  <ExternalLink className="h-8 w-8 text-[#FFD200] mb-3" />
                  <h4 className="text-white font-semibold mb-2">Social Media & Online</h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Instagram/TikTok bio verification</li>
                    <li>• YouTube video descriptions</li>
                    <li>• Portfolio website credentials</li>
                    <li>• NFT marketplace authenticity</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <FileText className="h-8 w-8 text-purple-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Business & Commercial</h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Client delivery documents</li>
                    <li>• Licensing agreement references</li>
                    <li>• Brand partnership verification</li>
                    <li>• Stock photo authenticity</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Award className="h-8 w-8 text-emerald-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Academic & Professional</h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Research paper citations</li>
                    <li>• Conference presentation credits</li>
                    <li>• Professional portfolio verification</li>
                    <li>• Grant application proof</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Verification */}
          <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-white text-xl font-semibold mb-2">Quick Verification</h3>
              <p className="text-white/60">
                Anyone can verify your Certificate ID instantly
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/70">Visit:</span>
                <code className="text-[#FFD200] font-mono flex-1">
                  https://loggin.com/certificate/[YOUR-CERTIFICATE-ID]
                </code>
              </div>
              
              <div className="text-center">
                <p className="text-white/70 mb-4">Or verify manually:</p>
                <div className="space-y-2 text-sm text-white/50">
                  <p>1. Go to Loggin.com</p>
                  <p>2. Click "Verify Certificate"</p>
                  <p>3. Enter your Certificate ID</p>
                  <p>4. View blockchain verification details</p>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="mb-4">
                <h4 className="text-emerald-400 font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  DO
                </h4>
              </div>
              <ul className="space-y-2 text-white/70">
                <li>✅ Keep Certificate ID secure until needed</li>
                <li>✅ Include in all commercial licensing</li>
                <li>✅ Save Certificate ID records for each work</li>
                <li>✅ Use when reporting theft or unauthorized use</li>
                <li>✅ Reference in legal documentation</li>
              </ul>
            </div>

            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="mb-4">
                <h4 className="text-red-400 font-semibold text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  DON'T
                </h4>
              </div>
              <ul className="space-y-2 text-white/70">
                <li>❌ Share Certificate ID publicly unless necessary</li>
                <li>❌ Use expired certificates for legal claims</li>
                <li>❌ Rely solely on Certificate ID without originals</li>
                <li>❌ Forget to document infringement evidence</li>
                <li>❌ Ignore blockchain verification status</li>
              </ul>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-8">
            <div className="mb-4">
              <h4 className="text-orange-400 font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency: Someone is Using Your Work Without Permission
              </h4>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-white font-medium mb-2">Immediate Steps:</h5>
                <ol className="space-y-1 text-white/70 text-sm">
                  <li>1. Document the infringement (screenshots, URLs)</li>
                  <li>2. Reference your Certificate ID as proof</li>
                  <li>3. File DMCA takedown including Certificate ID</li>
                  <li>4. Contact Loggin support for legal assistance</li>
                </ol>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">Contact Information:</h5>
                <div className="space-y-2 text-sm">
                  <div className="text-white/70">
                    <strong>Email:</strong> support@loggin.com
                  </div>
                  <div className="text-white/70">
                    <strong>Subject:</strong> "Copyright Infringement - [Certificate ID]"
                  </div>
                  <div className="text-white/70">
                    <strong>Response:</strong> Within 24 hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}