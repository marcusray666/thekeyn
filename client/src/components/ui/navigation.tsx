import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Upload, Award, LogOut, User, Building2, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Navigation() {
  const [location] = useLocation();
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
    { href: "/upload", label: "Try Demo", icon: Upload },
  ];

  const authenticatedNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/upload-work", label: "Upload", icon: Upload },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/copyright-registration", label: "Registration", icon: Building2 },
    { href: "/nft-minting", label: "NFT Studio", icon: Sparkles },
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
            <div className="logo-glass w-12 h-12 flex items-center justify-center">
              <span className="logo-p">P</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">Prooff</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-tutorial={
                  item.href === '/dashboard' ? 'dashboard-button' :
                  item.href === '/upload-work' ? 'upload-button' :
                  item.href === '/certificates' ? 'certificates-button' :
                  undefined
                }
                className={`flex items-center space-x-2 transition-colors ${
                  location === item.href
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.username}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
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
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-morphism rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location === item.href
                      ? "text-white bg-white bg-opacity-10"
                      : "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mobile User Section */}
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-gray-300 text-sm flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium btn-glass text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
