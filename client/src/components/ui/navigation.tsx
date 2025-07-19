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
    { href: "/copyright-registration", label: "Copyright Registration", icon: Building2 },
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

              {/* Logout Button */}
              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                </Button>
              )}

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
              <div className="text-green-400 text-xl font-bold">Mobile Menu</div>
              
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

              {/* User Section */}
              {isAuthenticated ? (
                <div className="border-t border-gray-700 pt-6 space-y-4">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Account</h3>
                  
                  <div className="bg-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{user?.username}</p>
                        <p className="text-gray-300 text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/showcase/${user?.username}`}
                    className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>Portfolio Showcase</span>
                  </Link>
                  
                  <Link 
                    href={`/profile/${user?.username}`}
                    className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-6 w-6" />
                    <span>View Profile</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/report-theft"
                    className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Award className="h-6 w-6" />
                    <span>Report Theft</span>
                  </Link>

                  <Link
                    href="/analytics"
                    className="flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>Analytics</span>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center space-x-4 px-4 py-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all justify-start text-lg"
                  >
                    <LogOut className="h-6 w-6" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </Button>
                </div>
              ) : (
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