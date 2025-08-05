import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Download, Share2, Eye, Search, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PremiumCertificates() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');

  // Fetch user's certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["/api/works"],
    queryFn: () => apiRequest("/api/works"),
  });

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.creatorName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && cert.isVerified) ||
                         (filterStatus === 'pending' && !cert.isVerified);
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/10 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white/10 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Feed</span>
              </button>
            </Link>
            <div className="w-px h-6 bg-white/20"></div>
            <h1 className="text-3xl font-bold text-white">My Certificates</h1>
            <div className="px-3 py-1 bg-[#FE3F5E]/20 border border-[#FE3F5E]/50 rounded-full">
              <span className="text-[#FE3F5E] text-sm font-medium">{certificates.length}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                />
              </div>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-[#FE3F5E]"
              >
                <option value="all" className="bg-[#1A1A1A] text-white">All Certificates</option>
                <option value="verified" className="bg-[#1A1A1A] text-white">Verified</option>
                <option value="pending" className="bg-[#1A1A1A] text-white">Pending</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        {filteredCertificates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {cert.title || cert.filename}
                      </h3>
                      <p className="text-white/70 text-sm">{cert.creatorName}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cert.isVerified 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                      {cert.isVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Created:</span>
                      <span className="text-white">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Type:</span>
                      <span className="text-white">
                        {cert.mimeType?.startsWith('image/') ? 'Image' :
                         cert.mimeType?.startsWith('audio/') ? 'Audio' :
                         cert.mimeType?.startsWith('video/') ? 'Video' : 'Document'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Hash:</span>
                      <span className="text-white font-mono text-xs">
                        {cert.sha256Hash?.substring(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/certificate/${cert.id}`}>
                      <Button className="glass-button flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button className="glass-button">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button className="glass-button">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {filteredCertificates.map((cert) => (
                  <div key={cert.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-xl flex items-center justify-center">
                            <span className="text-white text-lg">
                              {cert.mimeType?.startsWith('image/') ? '🎨' :
                               cert.mimeType?.startsWith('audio/') ? '🎵' :
                               cert.mimeType?.startsWith('video/') ? '🎬' : '📄'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {cert.title || cert.filename}
                            </h3>
                            <p className="text-white/70">{cert.creatorName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cert.isVerified 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        }`}>
                          {cert.isVerified ? 'Verified' : 'Pending'}
                        </div>
                        
                        <span className="text-white/50 text-sm">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Link href={`/certificate/${cert.id}`}>
                            <Button className="glass-button">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button className="glass-button">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button className="glass-button">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Certificates Found</h3>
            <p className="text-white/50 mb-6 max-w-sm mx-auto">
              {searchQuery ? 'No certificates match your search criteria.' : 'Start protecting your digital works to see certificates here.'}
            </p>
            <Link href="/upload">
              <Button className="accent-button">
                Protect Your First Work
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}