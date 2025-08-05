import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  Eye,
  Share2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalViews: number;
  totalShares: number;
  totalDownloads: number;
  growthRate: number;
  monthlyViews: Array<{ month: string; views: number; shares: number }>;
  topWorks: Array<{ title: string; views: number; certificateId: string }>;
  deviceTypes: Array<{ name: string; value: number }>;
  geographicData: Array<{ country: string; views: number }>;
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("6m");
  const { isAuthenticated } = useAuth();

  const { data: analyticsData, isLoading, refetch, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
    enabled: isAuthenticated,
  });

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Analytics</h3>
            <p className="text-white/60 text-sm mb-4">There was an error loading your analytics data.</p>
            <Button onClick={() => refetch()} className="glass-button">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show no data state if user has no analytics data
  if (!isLoading && analyticsData && analyticsData.totalViews === 0 && analyticsData.topWorks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Yet</h3>
            <p className="text-white/60 text-sm mb-4">Upload and share your work to start seeing analytics.</p>
            <Button onClick={() => setLocation('/upload')} className="accent-button">
              Upload Your First Work
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
            </div>
            <p className="text-white/60 text-sm">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const exportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalViews: analyticsData.totalViews,
        totalShares: analyticsData.totalShares,
        totalDownloads: analyticsData.totalDownloads,
        growthRate: analyticsData.growthRate
      },
      monthlyData: analyticsData.monthlyViews,
      topPerformingWorks: analyticsData.topWorks,
      deviceBreakdown: analyticsData.deviceTypes,
      geographicBreakdown: analyticsData.geographicData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 pt-24 pb-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          {/* Back Button */}
          <div className="flex items-center">
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Title Section */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/60 text-lg">Track your creative work performance and engagement</p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-end">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32 bg-black/20 backdrop-blur-sm border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F0F] border-white/10 backdrop-blur-xl">
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="sm"
                className="bg-black/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex-1 sm:flex-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                onClick={exportAnalytics}
                className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-4 py-2 rounded-xl border-0 flex-1 sm:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard className="text-center py-4 sm:py-6">
            <Eye className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1">
              {analyticsData?.totalViews.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Total Views</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <Share2 className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
              {analyticsData?.totalShares.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Total Shares</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <Download className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
              {analyticsData?.totalDownloads.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Downloads</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <TrendingUp className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-orange-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
              +{analyticsData?.growthRate}%
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Growth Rate</div>
          </GlassCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <GlassCard>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Views & Shares Over Time</h3>
              <AnalyticsChart
                type="line"
                data={analyticsData?.monthlyViews || []}
                dataKey="views"
                xAxisKey="month"
                colors={['#06B6D4']}
                className="h-80"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Device Types</h3>
              <AnalyticsChart
                type="pie"
                data={analyticsData?.deviceTypes || []}
                dataKey="value"
                colors={['#8B5CF6', '#06B6D4', '#10B981']}
                className="h-80"
              />
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Top Performing Works */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Top Performing Works</h3>
              <div className="space-y-4">
                {analyticsData?.topWorks.map((work, index) => (
                  <div key={work.certificateId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{work.title}</p>
                        <p className="text-sm text-gray-400">{work.certificateId.slice(-8)}</p>
                      </div>
                    </div>
                    <div className="text-cyan-400 font-semibold">
                      {work.views.toLocaleString()} views
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Geographic Data */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Geographic Distribution</h3>
              <div className="space-y-4">
                {analyticsData?.geographicData.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span className="text-white">{country.country}</span>
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      {country.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}