import { Download, Share2, QrCode, ExternalLink } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "./button";
import type { Work, Certificate } from "@shared/schema";

interface CertificateCardProps {
  work: Work;
  certificate?: Certificate;
}

export function CertificateCard({ work, certificate }: CertificateCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🎨';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <GlassCard floating className="max-w-2xl mx-auto">
      <div className="border-4 border-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center mb-8">
          <div className="logo-glass w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <span className="logo-p text-3xl">P</span>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-2">
            CERTIFICATE OF AUTHENTICITY
          </h3>
          <p className="text-gray-400">Blockchain-Verified Creative Work</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-6xl">
              {getFileTypeIcon(work.mimeType)}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Work Title</label>
              <p className="text-white font-semibold">{work.title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Creator</label>
              <p className="text-white font-semibold">{work.creatorName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Registration Date</label>
              <p className="text-white font-semibold">{formatDate(work.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Certificate ID</label>
              <p className="text-cyan-400 font-mono text-sm">{work.certificateId}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">Blockchain Hash</p>
              <p className="text-xs font-mono text-blue-400 break-all">
                {work.blockchainHash}
              </p>
            </div>
            <div className="flex space-x-4">
              {certificate?.qrCode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-glass"
                  onClick={() => {
                    // Open QR code in new window or modal
                    const win = window.open();
                    if (win) {
                      win.document.write(`<img src="${certificate.qrCode}" alt="QR Code" />`);
                    }
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
              )}
              {certificate?.shareableLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-glass"
                  onClick={() => copyToClipboard(certificate.shareableLink || '')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="btn-glass"
                onClick={() => window.print()}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
