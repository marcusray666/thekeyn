import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Calendar, Image, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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
    mimeType: string;
    createdAt: string;
  };
}

export default function MyCertificates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  if (authLoading || isLoading) {
    return <LiquidGlassLoader size="xl" text="Loading your certificates..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Certificates</h1>
          <p className="text-gray-400">Manage and view all your registered creative works</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-morphism border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <Button
            onClick={() => setLocation('/upload-work')}
            className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Register New Work
          </Button>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <GlassCard className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No certificates found" : "No certificates yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Start protecting your creative work by registering your first piece"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setLocation('/upload-work')}
                className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
              >
                <Plus className="mr-2 h-5 w-5" />
                Register Your First Work
              </Button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate: Certificate) => (
              <GlassCard 
                key={certificate.id} 
                className="hover:scale-105 transition-transform duration-200 cursor-pointer group"
                onClick={() => setLocation(`/certificate/${certificate.certificateId}`)}
              >
                <div className="p-6">
                  {/* Work Preview */}
                  <div className="mb-4">
                    {certificate.work.mimeType.startsWith('image/') ? (
                      <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-400">Image</span>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-400">
                          {certificate.work.mimeType.split('/')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Info */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {certificate.work.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {certificate.work.description || "No description provided"}
                  </p>

                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(certificate.createdAt)}
                  </div>

                  <div className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                    {certificate.certificateId}
                  </div>
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