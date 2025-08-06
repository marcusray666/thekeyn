import { useState, useEffect } from "react";
import { Shield, User, Calendar, Eye, Download } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface UrlPreviewProps {
  url: string;
  className?: string;
}

interface PreviewData {
  id: number;
  title: string;
  description: string;
  type: 'post' | 'work' | 'certificate';
  creatorName: string;
  creatorId: number;
  createdAt: string;
  thumbnailUrl?: string;
  isProtected?: boolean;
  isVerified?: boolean;
  stats?: {
    views: number;
    likes: number;
    shares: number;
  };
}

export function UrlPreview({ url, className = "" }: UrlPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        
        // Extract content ID and type from URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const contentType = pathParts[1]; // 'posts', 'certificates', 'works'
        const contentId = pathParts[2];

        if (!contentId || !contentType) {
          throw new Error('Invalid URL format');
        }

        // Fetch preview data from API
        const response = await fetch(`/api/preview/${contentType}/${contentId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        console.error('Error fetching URL preview:', err);
        setError('Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };

    if (url && (url.includes('/posts/') || url.includes('/certificates/') || url.includes('/works/'))) {
      fetchPreview();
    } else {
      setIsLoading(false);
      setError('Unsupported URL format');
    }
  }, [url]);

  if (isLoading) {
    return (
      <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-white/10 rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
            <span className="text-red-400 text-sm">❌</span>
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-sm">Failed to load preview</p>
            <p className="text-white/50 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (previewData.type) {
      case 'certificate':
      case 'work':
        return '📄';
      case 'post':
        return '💬';
      default:
        return '📄';
    }
  };

  const getTypeLabel = () => {
    switch (previewData.type) {
      case 'certificate':
        return 'Certificate';
      case 'work':
        return 'Protected Work';
      case 'post':
        return 'Community Post';
      default:
        return 'Content';
    }
  };

  return (
    <div 
      className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer ${className}`}
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail/Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
            {previewData.thumbnailUrl ? (
              <img 
                src={previewData.thumbnailUrl} 
                alt={previewData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{getTypeIcon()}</span>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white truncate">{previewData.title}</h3>
            {previewData.isProtected && (
              <Shield className="h-4 w-4 text-[#FE3F5E] flex-shrink-0" />
            )}
            {previewData.isVerified && (
              <div className="bg-blue-500/20 px-1 py-0.5 rounded text-xs text-blue-400 flex-shrink-0">
                Verified
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mb-2 line-clamp-2">{previewData.description}</p>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-white/50 mb-2">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{previewData.creatorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatTimeAgo(previewData.createdAt)}</span>
            </div>
            <div className="bg-[#FE3F5E]/20 px-2 py-0.5 rounded-full text-[#FE3F5E]">
              {getTypeLabel()}
            </div>
          </div>

          {/* Stats */}
          {previewData.stats && (
            <div className="flex items-center space-x-4 text-xs text-white/50">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{previewData.stats.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>❤️ {previewData.stats.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🔗 {previewData.stats.shares}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Indicator */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
            {previewData.type === 'certificate' || previewData.type === 'work' ? (
              <Download className="h-4 w-4 text-white/50" />
            ) : (
              <Eye className="h-4 w-4 text-white/50" />
            )}
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Click to open on Loggin'</span>
          {previewData.isProtected && (
            <div className="flex items-center space-x-1 text-[#FE3F5E]">
              <Shield className="h-3 w-3" />
              <span>Blockchain Protected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}