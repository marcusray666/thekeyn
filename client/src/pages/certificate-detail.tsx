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
  Stamp
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
  work: {
    id: number;
    title: string;
    description: string;
    creatorName: string;
    collaborators?: string[];
    originalName: string;
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
        blockchainHash: certificate.work.blockchainHash,
        createdAt: certificate.work.createdAt,
        shareableLink: certificate.shareableLink,
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

            {/* Blockchain Verification */}
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Hash className="h-6 w-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Blockchain Verification</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">File Hash (SHA-256)</label>
                    <p className="font-mono text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded mt-1 break-all">
                      {certificate.work.fileHash}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Blockchain Hash</label>
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