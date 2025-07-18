import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Upload, Award, LogOut, User, Building2, Sparkles, Users, Settings, ChevronDown, Smartphone, Crown, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
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
    { href: "/studio", label: "Studio", icon: Upload },
    { href: "/certificates", label: "My Certificates", icon: Award },
    { href: "/blockchain-verification", label: "Blockchain Verification", icon: Shield },
    { href: "/subscription", label: "Subscription", icon: Crown },
    { href: "/mobile", label: "Mobile App", icon: Smartphone },
    { href: "/copyright-registration", label: "Copyright Registration", icon: Building2 },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Loggin'</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  location === item.href
                    ? "text-white bg-purple-600/30 border border-purple-500/50"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user?.username}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-800/95 backdrop-blur-md border-gray-700 shadow-xl">
                    <DropdownMenuItem asChild>
                      <Link href={`/showcase/${user?.username}`} className="flex items-center w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Portfolio Showcase
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user?.username}`} className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-glass">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <button
            className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            onClick={() => {
              console.log('Hamburger clicked, current state:', isMenuOpen);
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div 
            className="md:hidden bg-gray-900/98 border-t border-gray-700 shadow-2xl"
            style={{ position: 'fixed', top: '64px', left: '0', right: '0', zIndex: 9999 }}
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-64px)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="text-green-400 text-xs mb-2">✓ Mobile Menu Active</div>
              
              {/* Main Navigation Items */}
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Navigation
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      location === item.href
                        ? "text-white bg-purple-600/30 border border-purple-500/50 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-md"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* User Profile Section */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    User Profile
                  </div>
                  <div className="px-4 py-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user?.username}</p>
                        <p className="text-xs text-gray-300 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/showcase/${user?.username}`}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Portfolio Showcase</span>
                  </Link>
                  
                  <Link 
                    href={`/profile/${user?.username}`}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">View Profile</span>
                  </Link>
                  
                  <div className="pt-3 border-t border-gray-700 space-y-2">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Account & Tools
                    </div>
                    
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Settings</span>
                    </Link>

                    <Link
                      href="/report-theft"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Report Theft</span>
                    </Link>

                    <Link
                      href="/analytics"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">Analytics</span>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all justify-start"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Account
                  </div>
                  <Link
                    href="/login"
                    className="block px-4 py-3 rounded-xl text-center font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-3 rounded-xl text-center font-medium btn-glass"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
