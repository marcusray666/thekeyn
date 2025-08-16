import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Download, Share2, Eye, Search, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleBackgroundEngine } from "@/components/SimpleBackgroundEngine";
import NoBorderElement from "@/components/NoBorderElement";

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
      <SimpleBackgroundEngine className="min-h-screen pt-24 pb-20 md:pb-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/60 rounded-3xl shadow-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white/60 rounded-3xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </SimpleBackgroundEngine>
    );
  }

  return (
    <SimpleBackgroundEngine className="min-h-screen pt-24 pb-20 md:pb-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 space-y-6 md:space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <Link href="/">
              <NoBorderElement className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm md:text-base">Back to Feed</span>
              </NoBorderElement>
            </Link>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-700">My Certificates</h1>
              <div className="px-3 py-1 bg-[#FE3F5E]/20 rounded-full no-border-absolutely-none">
                <span className="text-[#FE3F5E] text-sm font-medium">{certificates.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl no-border-absolutely-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/90 text-gray-900 placeholder-gray-600 rounded-xl shadow-sm no-border-absolutely-none"
                />
              </div>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/90 text-gray-900 rounded-xl px-4 py-2 focus:outline-none shadow-sm no-border-absolutely-none"
              >
                <option value="all" className="bg-white text-gray-900">All Certificates</option>
                <option value="verified" className="bg-white text-gray-900">Verified</option>
                <option value="pending" className="bg-white text-gray-900">Pending</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-200/50 text-gray-700' : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-gray-200/50 text-gray-700' : 'text-gray-600 hover:text-gray-700'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-white/95 transition-all duration-300 shadow-lg overflow-hidden no-border-absolutely-none">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3 overflow-hidden">
                      <h3 className="text-lg font-semibold text-gray-700 truncate overflow-hidden whitespace-nowrap">
                        {cert.title || cert.filename}
                      </h3>
                      <p className="text-gray-600 text-sm truncate overflow-hidden whitespace-nowrap">{cert.creatorName}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cert.isVerified 
                        ? 'bg-green-500/20 text-green-400 no-border-absolutely-none' 
                        : 'bg-yellow-500/20 text-yellow-400 no-border-absolutely-none'
                    }`}>
                      {cert.isVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-600">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-600">
                        {cert.mimeType?.startsWith('image/') ? 'Image' :
                         cert.mimeType?.startsWith('audio/') ? 'Audio' :
                         cert.mimeType?.startsWith('video/') ? 'Video' : 'Document'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hash:</span>
                      <span className="text-gray-600 font-mono text-xs">
                        {cert.sha256Hash?.substring(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/certificate/${cert.certificateId}`}>
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
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg no-border-absolutely-none">
              <div className="divide-y divide-white/50">
                {filteredCertificates.map((cert) => (
                  <div key={cert.id} className="p-6 hover:bg-white/95 transition-colors overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-6 max-w-[60%]">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg">
                              {cert.mimeType?.startsWith('image/') ? '🎨' :
                               cert.mimeType?.startsWith('audio/') ? '🎵' :
                               cert.mimeType?.startsWith('video/') ? '🎬' : '📄'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <h3 className="text-lg font-semibold text-gray-700 truncate overflow-hidden whitespace-nowrap">
                              {cert.title || cert.filename}
                            </h3>
                            <p className="text-gray-600 truncate overflow-hidden whitespace-nowrap">{cert.creatorName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cert.isVerified 
                            ? 'bg-green-500/20 text-green-400 no-border-absolutely-none' 
                            : 'bg-yellow-500/20 text-yellow-400 no-border-absolutely-none'
                        }`}>
                          {cert.isVerified ? 'Verified' : 'Pending'}
                        </div>
                        
                        <span className="text-gray-500 text-sm">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Link href={`/certificate/${cert.certificateId}`}>
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
          <div className="text-center py-12 md:py-16 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-white/60 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl md:text-4xl">🛡️</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Certificates Found</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm md:text-base">
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
    </SimpleBackgroundEngine>
  );
}