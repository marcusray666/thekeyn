import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Shield, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  BarChart3,
  Settings,
  Database,
  Globe,
  Check,
  X,
} from "lucide-react";

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalWorks: number;
  totalPosts: number;
  totalRevenue: number;
  storageUsed: number;
  blockchainVerifications: number;
  reportsPending: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  isVerified: boolean;
  isBanned: boolean;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  totalWorks: number;
  totalPosts: number;
  displayName?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface PendingWork {
  id: number;
  title: string;
  creatorName: string;
  moderationFlags: string[];
  moderationScore: number;
  filename: string;
  mimeType: string;
  createdAt: string;
}

interface ContentReport {
  id: number;
  reporterId: number;
  reportedUserId?: number;
  contentType: string;
  contentId: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  reporterUsername: string;
  reportedUsername?: string;
}

interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
  adminUsername: string;
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("pending");

  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ["/api/admin/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch users (always enabled to show metrics)
  const { data: users, isLoading: usersLoading, refetch: refetchUsers, error: usersError } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", userFilter, searchTerm],
    queryFn: async () => {
      const url = new URL('/api/admin/users', window.location.origin);
      if (userFilter && userFilter !== 'all') {
        url.searchParams.set('filter', userFilter);
      }
      if (searchTerm) {
        url.searchParams.set('search', searchTerm);
      }
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
  });

  // Debug logging
  console.log('Admin Dashboard Debug:', {
    selectedTab,
    usersLoading,
    usersCount: users?.length,
    userFilter,
    searchTerm
  });

  // Fetch content reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery<ContentReport[]>({
    queryKey: ["/api/admin/reports", reportFilter],
    enabled: selectedTab === "moderation",
  });

  // Fetch pending moderation works
  const { data: pendingWorks, isLoading: pendingWorksLoading, refetch: refetchPendingWorks } = useQuery<PendingWork[]>({
    queryKey: ["/api/admin/moderation/pending"],
    enabled: selectedTab === "moderation",
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: selectedTab === "audit",
  });

  const handleUserAction = async (userId: number, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        refetchUsers();
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleReportAction = async (reportId: number, action: string, resolution?: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });

      if (response.ok) {
        refetchReports();
      }
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
    }
  };

  const handleModerationAction = async (workId: number, action: string, resolution?: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/${workId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });

      if (response.ok) {
        refetchPendingWorks();
      }
    } catch (error) {
      console.error(`Failed to ${action} work:`, error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white pt-20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-purple-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-400">Complete platform management and monitoring</p>
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
              <p className="text-purple-200 font-medium">Admin Access Enabled</p>
              <p className="text-xs text-purple-300">Full platform control</p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 text-yellow-400">
              <Shield className="h-4 w-4" />
              Privacy Override
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {metricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-8 bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('users')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Total Users</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.totalUsers?.toLocaleString() || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('users')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Active Users (30d)</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.activeUsers?.toLocaleString() || 0}</p>
                      </div>
                      <Activity className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('users')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">New Signups</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.newSignups?.toLocaleString() || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('system')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-yellow-200">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                        <p className="text-xs text-yellow-300/80">Subscription earnings</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('content')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Protected Works</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.totalWorks?.toLocaleString() || 0}</p>
                      </div>
                      <Shield className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('content')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Community Posts</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.totalPosts?.toLocaleString() || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('system')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Storage Used</p>
                        <p className="text-2xl font-bold text-yellow-200">{formatBytes(metrics?.storageUsed || 0)}</p>
                      </div>
                      <Database className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm cursor-pointer hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                  onClick={() => setSelectedTab('moderation')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-400">Pending Reports</p>
                        <p className="text-2xl font-bold text-yellow-200">{metrics?.reportsPending?.toLocaleString() || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Privacy Override Tab - Admin can see ALL user information */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border-yellow-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Shield className="h-5 w-5" />
                      Admin Privacy Override Panel
                    </CardTitle>
                    <CardDescription className="text-yellow-200/80">
                      🔒 Access ALL user information regardless of privacy settings. Admin-only capability.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-500">
                    ADMIN ACCESS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Search */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by username, email, phone, or any private info..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800/50 border-yellow-600/50 text-white"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-48 bg-gray-800/50 border-yellow-600/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="verified">Verified Users</SelectItem>
                      <SelectItem value="banned">Banned Users</SelectItem>
                      <SelectItem value="admins">Admin Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users with Complete Private Information */}
                {usersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-32 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id} className="bg-gray-900/90 border-yellow-700/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              {/* Basic Info */}
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white text-lg">
                                    {user.displayName || user.username}
                                    {user.isVerified && <CheckCircle className="inline ml-2 h-4 w-4 text-blue-400" />}
                                    {user.isBanned && <Ban className="inline ml-2 h-4 w-4 text-red-400" />}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-100">@{user.username}</span>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                      {user.role}
                                    </Badge>
                                    <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                                      {user.subscriptionTier}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* PRIVATE INFORMATION - Admin Override */}
                              <div className="grid md:grid-cols-2 gap-6 p-4 bg-yellow-900/10 rounded-lg border border-yellow-600/30">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-yellow-400 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Private Contact Information
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="text-gray-300">Email:</span> <span className="text-gray-100">{user.email}</span></div>
                                    <div><span className="text-gray-300">Location:</span> <span className="text-gray-100">{user.location || 'Not provided'}</span></div>
                                    <div><span className="text-gray-300">Created:</span> <span className="text-gray-100">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                                    <div><span className="text-gray-300">Last Login:</span> <span className="text-gray-100">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span></div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <h4 className="font-medium text-yellow-400 flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    Account Statistics
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="text-gray-300">Total Works:</span> <span className="text-gray-100">{user.totalWorks || 0}</span></div>
                                    <div><span className="text-gray-300">Subscription:</span> <span className="text-gray-100">{user.subscriptionTier} ({user.subscriptionStatus})</span></div>
                                    <div><span className="text-gray-300">Verified:</span> <span className="text-gray-100">{user.isVerified ? 'Yes' : 'No'}</span></div>
                                    <div><span className="text-gray-300">Banned:</span> <span className="text-gray-100">{user.isBanned ? 'Yes' : 'No'}</span></div>
                                  </div>
                                </div>
                              </div>

                              {/* Privacy Settings Override */}
                              <div className="p-3 bg-red-900/20 rounded border border-red-600/50">
                                <h4 className="font-medium text-red-400 mb-2">🔓 Privacy Settings (Admin View)</h4>
                                <div className="text-xs text-red-200">
                                  Admin override active - All information visible regardless of user privacy preferences
                                </div>
                              </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="flex flex-col gap-2 ml-6">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm"
                                onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Profile
                              </Button>
                              
                              {!user.isBanned ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 backdrop-blur-sm">
                                      <Ban className="h-4 w-4 mr-1" />
                                      Ban User
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ban User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will ban {user.username} from the platform. This action can be reversed.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleUserAction(user.id, 'ban', 'Admin action')}>
                                        Ban User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 backdrop-blur-sm"
                                  onClick={() => handleUserAction(user.id, 'unban')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Unban
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No users found matching the current filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Management Controls */}
            <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-400">User Management</CardTitle>
                <CardDescription className="text-yellow-200/80">Search, filter, and manage platform users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900/50 border-gray-600"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-48 bg-gray-900/50 border-gray-600">
                      <SelectValue placeholder="Filter users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="pro">Pro Users</SelectItem>
                      <SelectItem value="recent">Recent Signups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {usersLoading ? (
                  <div className="space-y-3">
                    <div className="text-center py-4 text-yellow-300">Loading users...</div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900/80 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">{user.username}</span>
                              {user.isVerified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                              {user.isBanned && <Ban className="h-4 w-4 text-red-400" />}
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                {user.role}
                              </Badge>
                              <Badge variant="outline">{user.subscriptionTier}</Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{user.email}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{user.followerCount || 0} followers</span>
                              <span>•</span>
                              <span>{user.totalLikes || 0} likes</span>
                              <span>•</span>
                              <span>{user.totalWorks || 0} works</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 backdrop-blur-sm"
                            onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {!user.isVerified && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 backdrop-blur-sm">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-800 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Verify User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will give {user.username} a verified badge. Are you sure?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-gray-600">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUserAction(user.id, 'verify')}>
                                    Verify
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {!user.isBanned ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 backdrop-blur-sm">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-800 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will ban {user.username} from the platform. This action can be reversed later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-gray-600">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleUserAction(user.id, 'ban', 'Admin action')}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ban User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 backdrop-blur-sm"
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-yellow-300/80">
                    No users found matching the current filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            {/* Pending AI Moderation Section */}
            <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      AI Content Moderation
                    </CardTitle>
                    <CardDescription>Review content flagged by AI moderation system</CardDescription>
                  </div>
                  <div className="text-sm text-gray-400">
                    {pendingWorks?.length || 0} works awaiting review
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingWorksLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : pendingWorks && pendingWorks.length > 0 ? (
                  <div className="space-y-3">
                    {pendingWorks.map((work) => (
                      <div key={work.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-white">{work.title}</h4>
                              <div className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full ${
                                  work.moderationScore > 0.7 ? 'bg-red-400' : 
                                  work.moderationScore > 0.5 ? 'bg-yellow-400' : 'bg-green-400'
                                }`}></div>
                                <span className="text-xs text-gray-400">
                                  Risk: {Math.round(work.moderationScore * 100)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>Creator: {work.creatorName}</div>
                              <div>File: {work.filename} ({work.mimeType})</div>
                              <div>Submitted: {new Date(work.createdAt).toLocaleDateString()}</div>
                              {work.moderationFlags.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="text-xs text-orange-400">AI Flags:</span>
                                  {work.moderationFlags.map((flag, i) => (
                                    <Badge key={i} variant="destructive" className="text-xs">
                                      {flag.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 backdrop-blur-sm"
                              onClick={() => handleModerationAction(work.id, 'approve', 'Manual review: Content approved')}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/50 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 backdrop-blur-sm"
                              onClick={() => handleModerationAction(work.id, 'reject', 'Manual review: Content rejected')}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-400">No content pending moderation review</p>
                    <p className="text-sm text-gray-500 mt-1">All uploaded works have been automatically approved</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Reports Section */}
            <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle>User Content Reports</CardTitle>
                <CardDescription>Review and manage user-submitted content reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger className="w-48 bg-gray-900/50 border-gray-600">
                    <SelectValue placeholder="Filter reports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>

                {reportsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports?.map((report) => (
                      <div key={report.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{report.contentType}</Badge>
                              <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                                {report.status}
                              </Badge>
                              <span className="text-sm text-gray-400">#{report.id}</span>
                            </div>
                            <p className="font-medium">Reason: {report.reason}</p>
                            <p className="text-sm text-gray-400 mb-2">
                              Reported by: {report.reporterUsername}
                              {report.reportedUsername && ` • Against: ${report.reportedUsername}`}
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-300 mb-2">{report.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleString()}
                            </p>
                          </div>
                          
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gradient-to-r from-gray-600/20 to-slate-600/20 border-gray-500/50 text-gray-300 hover:from-gray-500/30 hover:to-slate-500/30 backdrop-blur-sm"
                                onClick={() => handleReportAction(report.id, 'dismiss', 'No violation found')}
                              >
                                <XCircle className="h-4 w-4" />
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/50 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 backdrop-blur-sm"
                                onClick={() => handleReportAction(report.id, 'resolve', 'Content removed')}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Track all administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs?.map((log) => (
                      <div key={log.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-sm font-medium">{log.adminUsername}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {log.targetType} ID: {log.targetId}
                            </p>
                            {log.details && (
                              <p className="text-sm text-gray-300 mt-1">{log.details}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Database Management</CardTitle>
                  <CardDescription className="text-yellow-200/80">Monitor database health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300">Total Storage Used</span>
                    <span className="font-mono text-yellow-200">{formatBytes(metrics?.storageUsed || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300">Platform Revenue</span>
                    <span className="font-mono text-yellow-200">{formatCurrency(metrics?.totalRevenue || 0)}</span>
                  </div>
                  {metrics?.subscriptionBreakdown && (
                    <div className="mt-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                      <h4 className="text-sm font-medium text-yellow-300 mb-2">Subscription Breakdown</h4>
                      <div className="space-y-1 text-xs text-yellow-200/80">
                        <div className="flex justify-between">
                          <span>Free Users:</span>
                          <span>{metrics.subscriptionBreakdown.free}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Starter ($9.99/mo):</span>
                          <span>{metrics.subscriptionBreakdown.starter}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pro ($19.99/mo):</span>
                          <span>{metrics.subscriptionBreakdown.pro}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300">Blockchain Verifications</span>
                    <span className="font-mono text-yellow-200">{metrics?.blockchainVerifications || 0}</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-yellow-700/20 to-orange-700/20 border-yellow-600/50 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30 backdrop-blur-sm" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Run Database Maintenance
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-400">System Settings</CardTitle>
                  <CardDescription className="text-yellow-200/80">Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-yellow-700/20 to-orange-700/20 border-yellow-600/50 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30 backdrop-blur-sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export System Data
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-yellow-700/20 to-orange-700/20 border-yellow-600/50 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30 backdrop-blur-sm" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Update Privacy Policy
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-yellow-700/20 to-orange-700/20 border-yellow-600/50 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30 backdrop-blur-sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Rate Limits
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}