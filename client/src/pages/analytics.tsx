import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  Users,
  Eye,
  Share2,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
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
  const { user, isAuthenticated } = useAuth();

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    enabled: isAuthenticated,
  });

  // Mock analytics data for demonstration
  const mockAnalytics: AnalyticsData = {
    totalViews: 15847,
    totalShares: 1204,
    totalDownloads: 892,
    growthRate: 23.5,
    monthlyViews: [
      { month: 'Jan', views: 1200, shares: 89 },
      { month: 'Feb', views: 1890, shares: 145 },
      { month: 'Mar', views: 2100, shares: 178 },
      { month: 'Apr', views: 2800, shares: 201 },
      { month: 'May', views: 3200, shares: 287 },
      { month: 'Jun', views: 4657, shares: 304 },
    ],
    topWorks: [
      { title: 'Digital Landscape #1', views: 2847, certificateId: 'PRF-2025-ABC123' },
      { title: 'Abstract Portrait Series', views: 1923, certificateId: 'PRF-2025-DEF456' },
      { title: 'Urban Photography Collection', views: 1654, certificateId: 'PRF-2025-GHI789' },
      { title: 'Minimalist Design Pack', views: 1432, certificateId: 'PRF-2025-JKL012' },
      { title: 'Nature Concept Art', views: 1201, certificateId: 'PRF-2025-MNO345' },
    ],
    deviceTypes: [
      { name: 'Desktop', value: 45 },
      { name: 'Mobile', value: 35 },
      { name: 'Tablet', value: 20 },
    ],
    geographicData: [
      { country: 'United States', views: 5847 },
      { country: 'United Kingdom', views: 2104 },
      { country: 'Germany', views: 1923 },
      { country: 'Canada', views: 1654 },
      { country: 'Australia', views: 1432 },
    ]
  };

  const analytics = analyticsData || mockAnalytics;

  if (isLoading) {
    return <LiquidGlassLoader size="xl" text="Loading analytics..." />;
  }

  const exportAnalytics = () => {
    const exportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalViews: analytics.totalViews,
        totalShares: analytics.totalShares,
        totalDownloads: analytics.totalDownloads,
        growthRate: analytics.growthRate
      },
      monthlyData: analytics.monthlyViews,
      topPerformingWorks: analytics.topWorks,
      deviceBreakdown: analytics.deviceTypes,
      geographicBreakdown: analytics.geographicData
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-8 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="space-y-4 mb-8">
          {/* Back Button */}
          <div className="flex items-center">
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Title Section */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm sm:text-base">Track your creative work performance and engagement</p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-end">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32 glass-morphism border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 flex-1 sm:flex-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                onClick={exportAnalytics}
                className="btn-glass px-4 py-2 rounded-2xl font-semibold text-white flex-1 sm:flex-none"
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
              {analytics.totalViews.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Total Views</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <Share2 className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
              {analytics.totalShares.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Total Shares</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <Download className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
              {analytics.totalDownloads.toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Downloads</div>
          </GlassCard>
          
          <GlassCard className="text-center py-4 sm:py-6">
            <TrendingUp className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-orange-400 mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
              +{analytics.growthRate}%
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
                data={analytics.monthlyViews}
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
                data={analytics.deviceTypes}
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
                {analytics.topWorks.map((work, index) => (
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
                {analytics.geographicData.map((country, index) => (
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