import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Upload, Award, LogOut, User, Sparkles, Users, Settings, ChevronDown, Smartphone, Crown, Shield, MessageCircle, BarChart3, AlertTriangle, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NotificationCenter from "@/components/NotificationCenter";

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  displayName?: string;
  profileImageUrl?: string;
}

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null };
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You've been logged out successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Redirect to home page after logout
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Unable to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publicNavItems = [
    { href: "/", label: "Home", icon: Home },
  ];

  const authenticatedNavItems = [
    { href: "/", label: "Portfolio", icon: Home },
    { href: "/social", label: "Community", icon: Users },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/studio", label: "Studio", icon: Upload },
    { href: "/subscription", label: "Subscription", icon: Crown },
    ...(user?.role === 'admin' ? [{ href: "/admin", label: "Admin Dashboard", icon: Shield }] : []),
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white nav-logo">Loggin'</h1>
            </Link>
            
            {/* Extra Large screen navigation - full text */}
            <div className="hidden xl:flex items-center space-x-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-md transition-all text-sm ${
                    location === item.href
                      ? "text-white bg-purple-600/30 border border-purple-500/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Large screen navigation - compact text */}
            <div className="hidden lg:flex xl:hidden items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-1.5 py-1 rounded-md transition-all text-xs ${
                    location === item.href
                      ? "text-white bg-purple-600/30 border border-purple-500/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-3 w-3" />
                  <span className="font-medium">{item.label.replace('My ', '').replace('Blockchain ', '')}</span>
                </Link>
              ))}
            </div>

            {/* Medium screen navigation - icons only */}
            <div className="hidden md:flex lg:hidden items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center p-1.5 rounded-md transition-all ${
                    location === item.href
                      ? "text-white bg-purple-600/30 border border-purple-500/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  title={item.label}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>

            {/* Notifications & User Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* Notification Center */}
                <NotificationCenter />
                
                {/* User Dropdown */}
                <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5 px-2 py-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-sm hidden sm:inline">{user?.username}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 !bg-gray-900 !text-white !border-gray-600 shadow-2xl"
                    style={{
                      backgroundColor: 'rgb(17, 24, 39)',
                      color: 'white',
                      borderColor: 'rgb(75, 85, 99)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    {/* Account Section */}
                    <div className="px-3 py-2 border-b border-gray-600" style={{ borderColor: 'rgb(75, 85, 99)' }}>
                      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgb(209, 213, 219)' }}>Account</div>
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/profile/${user?.username}`}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform cursor-pointer"
                        >
                          {user?.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.displayName || user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user?.username?.charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate" style={{ color: 'white' }}>{user?.displayName || user?.username}</div>
                          <div className="text-xs truncate" style={{ color: 'rgb(229, 231, 235)' }}>{user?.email || `${user?.username}@loggin.app`}</div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator style={{ backgroundColor: 'rgb(75, 85, 99)' }} />
                    
                    {/* Navigation Items */}
                    <DropdownMenuItem asChild>
                      <Link 
                        href={`/profile/${user?.username}`} 
                        className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                        style={{ color: 'rgb(229, 231, 235)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(229, 231, 235)';
                        }}
                      >
                        <Eye className="mr-3 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/settings" 
                        className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                        style={{ color: 'rgb(229, 231, 235)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(229, 231, 235)';
                        }}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/security" 
                        className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                        style={{ color: 'rgb(229, 231, 235)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(229, 231, 235)';
                        }}
                      >
                        <Shield className="mr-3 h-4 w-4" />
                        Security
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/report-theft" 
                        className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                        style={{ color: 'rgb(229, 231, 235)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(229, 231, 235)';
                        }}
                      >
                        <AlertTriangle className="mr-3 h-4 w-4" />
                        Report Theft
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/analytics" 
                        className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                        style={{ color: 'rgb(229, 231, 235)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(229, 231, 235)';
                        }}
                      >
                        <BarChart3 className="mr-3 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin Option - Only visible to admins */}
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator style={{ backgroundColor: 'rgb(75, 85, 99)' }} />
                        
                        <DropdownMenuItem asChild>
                          <Link 
                            href="/admin-dashboard" 
                            className="flex items-center w-full py-2 px-2 rounded-sm transition-colors"
                            style={{ color: 'rgb(251, 191, 36)' }} // Gold color for admin
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.2)';
                              e.currentTarget.style.color = 'rgb(254, 240, 138)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'rgb(251, 191, 36)';
                            }}
                          >
                            <Shield className="mr-3 h-4 w-4" />
                            Admin Control Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator style={{ backgroundColor: 'rgb(75, 85, 99)' }} />
                    
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center w-full py-2 px-2 rounded-sm transition-colors cursor-pointer"
                      style={{ color: 'rgb(248, 113, 113)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
                        e.currentTarget.style.color = 'rgb(252, 165, 165)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(248, 113, 113)';
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5 text-sm px-3 py-1.5">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 text-sm px-3 py-1.5">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            <button
              className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-gray-900 z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
              {isAuthenticated && (
                <>
                  {/* Account Section */}
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Account</div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user?.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.displayName || user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{user?.username}</div>
                        <div className="text-gray-400 text-sm truncate">{user?.email || `${user?.username}@loggin.app`}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Navigation Links */}
              <div className="space-y-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Navigation</h3>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-xl text-lg transition-all ${
                      location === item.href
                        ? "text-white bg-purple-600/30 border border-purple-500/50"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Additional User Options */}
              {isAuthenticated && (
                <div className="space-y-3">
                  <Link 
                    href={`/profile/${user?.username}`}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Eye className="h-5 w-5" />
                    <span>View Profile</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/report-theft"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>Report Theft</span>
                  </Link>

                  <Link
                    href="/analytics"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all justify-start"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </Button>
                </div>
              )}
              
              {/* Auth Section for Non-Authenticated Users */}
              {!isAuthenticated && (
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Account</h3>
                  <Link
                    href="/login"
                    className="block px-6 py-4 rounded-xl text-center font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-6 py-4 rounded-xl text-center font-medium btn-glass text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}