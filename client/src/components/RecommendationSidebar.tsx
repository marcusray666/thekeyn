import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Heart, 
  Share2, 
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  type: 'trending' | 'personalized' | 'similar' | 'inspiration';
  title: string;
  description: string;
  confidence: number;
  tags: string[];
  reason: string;
  actionUrl?: string;
  creatorName?: string;
  metrics?: {
    likes: number;
    shares: number;
    views: number;
  };
}

interface RecommendationSidebarProps {
  className?: string;
  userId?: string;
  currentPage?: string;
}

export function RecommendationSidebar({ 
  className = "", 
  userId, 
  currentPage = "dashboard" 
}: RecommendationSidebarProps) {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: recommendations = [], isLoading, refetch } = useQuery({
    queryKey: ['recommendations', userId, currentPage, refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          context: currentPage,
          limit: 8
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
    toast({
      title: "Refreshing recommendations",
      description: "Getting fresh AI-powered suggestions...",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-400" />;
      case 'personalized':
        return <Star className="h-4 w-4 text-purple-400" />;
      case 'similar':
        return <Users className="h-4 w-4 text-cyan-400" />;
      case 'inspiration':
        return <Lightbulb className="h-4 w-4 text-emerald-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-white/60" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trending':
        return 'Trending';
      case 'personalized':
        return 'For You';
      case 'similar':
        return 'Similar';
      case 'inspiration':
        return 'Inspiration';
      default:
        return 'AI Pick';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className={`w-80 ${className}`}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`w-80 ${className}`}>
      <GlassCard className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="bg-black/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          {recommendations.map((rec: Recommendation) => (
            <div key={rec.id} className="group">
              <GlassCard className="p-3 hover:bg-white/10 transition-all cursor-pointer bg-white/5 border border-white/10">
                {/* Header with type and confidence */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(rec.type)}
                    <Badge 
                      variant="outline" 
                      className="text-xs border-white/20 text-white/70"
                    >
                      {getTypeLabel(rec.type)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Zap className={`h-3 w-3 ${getConfidenceColor(rec.confidence)}`} />
                    <span className={`text-xs ${getConfidenceColor(rec.confidence)}`}>
                      {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">
                  {rec.title}
                </h4>
                <p className="text-xs text-white/60 mb-3 line-clamp-2">
                  {rec.description}
                </p>

                {/* Tags */}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-white/10 text-white/70 border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Metrics */}
                {rec.metrics && (
                  <div className="flex items-center space-x-4 text-xs text-white/50 mb-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{rec.metrics.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-3 w-3" />
                      <span>{rec.metrics.shares}</span>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/50 italic">
                    {rec.reason}
                  </p>
                  <ChevronRight className="h-3 w-3 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">
            Powered by AI • Updates every 5 minutes
          </p>
        </div>
      </GlassCard>
    </div>
  );
}