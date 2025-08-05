import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Shield, 
  FileText, 
  Calendar,
  User,
  Hash,
  ExternalLink,
  AlertTriangle,
  Building,
  Stamp,
  Bitcoin,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { WorkImage } from "@/components/work-image";

interface CertificateData {
  id: number;
  workId: number;
  certificateId: string;
  shareableLink: string;
  qrCode: string;
  createdAt: string;
  verificationProof?: string;
  work: {
    id: number;
    title: string;
    description: string;
    creatorName: string;
    collaborators?: string[];
    originalName: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    fileHash: string;
    blockchainHash: string;
    createdAt: string;
  };
}

export default function CertificateDetail() {
  const [, params] = useRoute("/certificate/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const certificateId = params?.id;

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ["/api/certificate", certificateId],
    enabled: !!certificateId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleShare = async () => {
    if (navigator.share && certificate) {
      try {
        await navigator.share({
          title: `Certificate for "${certificate.work.title}"`,
          text: `Blockchain-verified certificate of authenticity for creative work`,
          url: certificate.shareableLink,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (certificate) {
      navigator.clipboard.writeText(certificate.shareableLink);
      toast({
        title: "Link copied!",
        description: "Certificate link has been copied to your clipboard.",
      });
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    
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
      
      // Parse verification proof for certificate generation
      let verificationProof;
      try {
        verificationProof = certificate.verificationProof ? JSON.parse(certificate.verificationProof) : undefined;
      } catch (e) {
        verificationProof = undefined;
      }
      
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
        verificationProof: verificationProof
      });
      
      toast({
        title: "Certificate downloaded!",
        description: "Your PDF certificate has been saved to your device.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to generate certificate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportTheft = () => {
    setLocation(`/report-theft/${certificateId}`);
  };

  const handleGovernmentSubmission = () => {
    // Open copyright office website
    window.open('https://www.copyright.gov/registration/', '_blank');
    toast({
      title: "Redirected to Copyright Office",
      description: "Use your certificate as supporting documentation.",
    });
  };

  const handleNotaryService = () => {
    // Open notary service website
    window.open('https://www.notarize.com/', '_blank');
    toast({
      title: "Redirected to Notary Service",
      description: "Get your certificate professionally notarized.",
    });
  };

  const handleDownloadOts = async () => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/ots-download`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download OTS file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${certificate?.work.title.replace(/[^a-zA-Z0-9]/g, '_') || 'timestamp'}.ots`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Bitcoin timestamp file (.ots) downloaded successfully"
      });
    } catch (error) {
      console.error('OTS download error:', error);
      toast({
        title: "Error",
        description: "Failed to download Bitcoin timestamp file",
        variant: "destructive"
      });
    }
  };

  const handleDownloadEthereumProof = async () => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/ethereum-proof`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download Ethereum proof');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${certificate?.work.title.replace(/[^a-zA-Z0-9]/g, '_') || 'ethereum'}_proof.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success", 
        description: "Ethereum blockchain proof downloaded successfully"
      });
    } catch (error) {
      console.error('Ethereum proof download error:', error);
      toast({
        title: "Error",
        description: "Failed to download Ethereum proof",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LiquidGlassLoader size="xl" text="Loading certificate..." />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
        <GlassCard className="text-center py-16 max-w-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Certificate Not Found</h2>
          <p className="text-gray-400 mb-6">
            The certificate you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => setLocation('/certificates')}
            className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certificates
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/certificates')}
            className="text-gray-400 hover:text-gray-300 hover:bg-white hover:bg-opacity-5 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Certificates
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {certificate.work.title}
              </h1>
              <p className="text-gray-400">
                Certificate of Authenticity
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              
              <Button
                onClick={handleDownloadCertificate}
                className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Certificate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificate Details */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Certificate Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-400">Certificate ID</label>
                    <p className="font-mono text-purple-400 bg-purple-900/20 px-3 py-2 rounded mt-1">
                      {certificate.certificateId}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Registration Date</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-white">{formatDate(certificate.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Creator</label>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-white">{certificate.work.creatorName}</p>
                    </div>
                  </div>

                  {certificate.work.collaborators && certificate.work.collaborators.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400">Collaborators</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {certificate.work.collaborators.map((collaborator, index) => (
                          <span
                            key={index}
                            className="text-sm bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded"
                          >
                            {collaborator}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm text-gray-400">File Size</label>
                    <p className="text-white mt-1">{formatFileSize(certificate.work.fileSize)}</p>
                  </div>
                </div>
                
                {certificate.work.description && (
                  <div className="mt-6">
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white mt-1 leading-relaxed">
                      {certificate.work.description}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Dual Blockchain Verification */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Hash className="h-6 w-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Dual Blockchain Verification</h2>
                </div>
                
                <div className="space-y-6">
                  {/* File Hash */}
                  <div>
                    <label className="text-sm text-gray-400">File Hash (SHA-256)</label>
                    <p className="font-mono text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded mt-1 break-all">
                      {certificate.work.fileHash}
                    </p>
                  </div>
                  
                  {/* Parse verification proof for new dual blockchain data */}
                  {(() => {
                    let verificationData;
                    try {
                      verificationData = certificate.verificationProof ? JSON.parse(certificate.verificationProof) : null;
                    } catch (e) {
                      verificationData = null;
                    }

                    return (
                      <>
                        {/* Bitcoin OpenTimestamps Section */}
                        <div className="border-l-4 border-orange-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Bitcoin className="h-5 w-5 text-orange-500 mr-2" />
                              <h3 className="text-lg font-semibold text-orange-300">Bitcoin Blockchain</h3>
                            </div>
                            {verificationData?.bitcoin?.otsProof && (
                              <Button
                                size="sm"
                                onClick={handleDownloadOts}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download .ots
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-400">Status</label>
                              <p className="text-sm text-white">
                                {verificationData?.bitcoin?.verificationStatus === 'pending' 
                                  ? '🕒 Pending (1-6 hours for Bitcoin confirmation)'
                                  : verificationData?.bitcoin?.verificationStatus === 'confirmed'
                                  ? '✅ Bitcoin timestamp confirmed'
                                  : verificationData?.hasBitcoinTimestamp 
                                  ? '⚡ OpenTimestamps active'
                                  : '❌ Not available'
                                }
                              </p>
                            </div>
                            {verificationData?.bitcoin?.blockHeight && (
                              <div>
                                <label className="text-xs text-gray-400">Block Height</label>
                                <p className="text-sm text-orange-300">{verificationData.bitcoin.blockHeight}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              Verify at: <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">opentimestamps.org</a>
                            </p>
                          </div>
                        </div>

                        {/* Ethereum Blockchain Section */}
                        <div className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Coins className="h-5 w-5 text-blue-500 mr-2" />
                              <h3 className="text-lg font-semibold text-blue-300">Ethereum Blockchain</h3>
                            </div>
                            {verificationData?.ethereum?.success && (
                              <Button
                                size="sm"
                                onClick={handleDownloadEthereumProof}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Proof
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-400">Status</label>
                              <p className="text-sm text-white">
                                {verificationData?.ethereum?.success 
                                  ? '✅ Ethereum anchor confirmed'
                                  : verificationData?.hasImmediateVerification
                                  ? '⚡ Immediate verification available'
                                  : '❌ Not available'
                                }
                              </p>
                            </div>
                            {verificationData?.ethereum?.transactionHash && (
                              <div>
                                <label className="text-xs text-gray-400">Transaction</label>
                                <p className="text-sm text-blue-300 font-mono">
                                  {verificationData.ethereum.transactionHash.substring(0, 20)}...
                                </p>
                              </div>
                            )}
                            {verificationData?.ethereum?.blockNumber && (
                              <div>
                                <label className="text-xs text-gray-400">Block Number</label>
                                <p className="text-sm text-blue-300">{verificationData.ethereum.blockNumber}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              Verify at: {verificationData?.ethereum?.verificationUrl ? (
                                <a href={verificationData.ethereum.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  Etherscan
                                </a>
                              ) : (
                                <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">etherscan.io</a>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Verification Summary */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Verification Summary</h4>
                          <div className="text-sm">
                            {verificationData?.dualAnchorComplete ? (
                              <p className="text-green-400">✅ DUAL BLOCKCHAIN VERIFICATION COMPLETE</p>
                            ) : verificationData?.hasImmediateVerification ? (
                              <p className="text-blue-400">⚡ Ethereum verified - Bitcoin pending</p>
                            ) : verificationData?.isRealBlockchain ? (
                              <p className="text-yellow-400">🕒 Blockchain verification in progress</p>
                            ) : (
                              <p className="text-gray-400">⚠️ Limited blockchain verification</p>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  
                  {/* Legacy blockchain hash display */}
                  <div>
                    <label className="text-sm text-gray-400">Legacy Blockchain Hash</label>
                    <p className="font-mono text-sm text-cyan-400 bg-cyan-900/20 px-3 py-2 rounded mt-1 break-all">
                      {certificate.work.blockchainHash}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Work Preview */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Work Preview</h2>
                </div>
                
                <WorkImage
                  filename={certificate.work.filename}
                  mimeType={certificate.work.mimeType}
                  title={certificate.work.title}
                  className="w-full h-48 mb-4"
                />
                
                <div className="text-sm text-gray-400">
                  <p><span className="font-medium">Original Name:</span> {certificate.work.originalName}</p>
                  <p><span className="font-medium">File Type:</span> {certificate.work.mimeType}</p>
                </div>
              </div>
            </GlassCard>
            
            {/* QR Code */}
            <GlassCard>
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
                <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center mb-4">
                  <p className="text-xs text-gray-600 text-center px-2">QR Code<br/>Placeholder</p>
                </div>
                <p className="text-sm text-gray-400">
                  Scan to verify certificate authenticity
                </p>
              </div>
            </GlassCard>

            {/* Actions */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleGovernmentSubmission}
                    variant="outline"
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 text-sm py-3 h-auto whitespace-normal text-left"
                  >
                    <Building className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">Submit to Copyright Office</span>
                  </Button>
                  
                  <Button
                    onClick={handleNotaryService}
                    variant="outline"
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 text-sm py-3 h-auto whitespace-normal text-left"
                  >
                    <Stamp className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">Get Notarized</span>
                  </Button>
                  
                  <Button
                    onClick={handleReportTheft}
                    variant="outline"
                    className="w-full justify-start border-red-600 text-red-400 hover:bg-red-900 hover:bg-opacity-20 text-sm py-3 h-auto whitespace-normal text-left"
                  >
                    <AlertTriangle className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">Report Theft</span>
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* File Info */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">File Information</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original Name:</span>
                    <span className="text-white">{certificate.work.originalName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{certificate.work.mimeType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">{formatFileSize(certificate.work.fileSize)}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}