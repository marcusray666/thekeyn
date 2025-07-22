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
  Globe
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
  totalLikes: number;
  createdAt: string;
  lastLoginAt?: string;
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

  // Fetch users
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", userFilter, searchTerm],
    enabled: selectedTab === "users",
  });

  // Fetch content reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery<ContentReport[]>({
    queryKey: ["/api/admin/reports", reportFilter],
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-400">Complete platform management and monitoring</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
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
                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold">{metrics?.totalUsers?.toLocaleString() || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Users (30d)</p>
                        <p className="text-2xl font-bold">{metrics?.activeUsers?.toLocaleString() || 0}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">New Signups</p>
                        <p className="text-2xl font-bold">{metrics?.newSignups?.toLocaleString() || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Protected Works</p>
                        <p className="text-2xl font-bold">{metrics?.totalWorks?.toLocaleString() || 0}</p>
                      </div>
                      <Shield className="h-8 w-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Community Posts</p>
                        <p className="text-2xl font-bold">{metrics?.totalPosts?.toLocaleString() || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Storage Used</p>
                        <p className="text-2xl font-bold">{formatBytes(metrics?.storageUsed || 0)}</p>
                      </div>
                      <Database className="h-8 w-8 text-indigo-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Pending Reports</p>
                        <p className="text-2xl font-bold">{metrics?.reportsPending?.toLocaleString() || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Management Controls */}
            <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search, filter, and manage platform users</CardDescription>
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
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.username}</span>
                              {user.isVerified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                              {user.isBanned && <Ban className="h-4 w-4 text-red-400" />}
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                {user.role}
                              </Badge>
                              <Badge variant="outline">{user.subscriptionTier}</Badge>
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              {user.followerCount} followers • {user.totalLikes} likes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {!user.isVerified && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
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
                                <Button size="sm" variant="destructive">
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
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and manage content reports</CardDescription>
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
                                onClick={() => handleReportAction(report.id, 'dismiss', 'No violation found')}
                              >
                                <XCircle className="h-4 w-4" />
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
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
              <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Monitor database health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Storage Used</span>
                    <span className="font-mono">{formatBytes(metrics?.storageUsed || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Blockchain Verifications</span>
                    <span className="font-mono">{metrics?.blockchainVerifications || 0}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Run Database Maintenance
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export System Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Update Privacy Policy
                  </Button>
                  <Button className="w-full" variant="outline">
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