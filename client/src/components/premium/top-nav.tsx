import { Link, useLocation } from "wouter";
import { Search, Menu, Bell, MessageCircle, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function TopNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Handle scroll behavior to hide/show navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide nav
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show nav
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`hidden md:flex items-center justify-between px-8 py-6 bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="text-2xl font-bold text-white">Loggin'</span>
        </div>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
          <input
            type="text"
            placeholder="Search creators, works..."
            className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-[#FE3F5E] transition-colors"
            onChange={(e) => {
              // Search functionality would go here
              console.log('Search:', e.target.value);
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        <Link href="/upload">
          <Button className="glass-button !px-4 !py-2">
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </Button>
        </Link>
        
        <Link href="/messages">
          <Button className="glass-button p-3">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
        
        <Button className="glass-button p-3">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="creator-avatar"
          >
            <div className="avatar-inner">
              {(user as any)?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl py-2 shadow-2xl z-50">
              <Link href="/profile">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">👤</span>
                  <span className="text-white font-medium">Profile</span>
                </div>
              </Link>
              
              <div className="border-t border-white/10 my-2"></div>
              
              <Link href="/certificates">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">🛡️</span>
                  <span className="text-white font-medium">My Certificates</span>
                </div>
              </Link>
              
              <Link href="/analytics">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">📊</span>
                  <span className="text-white font-medium">Analytics</span>
                </div>
              </Link>
              
              <Link href="/blockchain-verification">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">⛓️</span>
                  <span className="text-white font-medium">Blockchain Verification</span>
                </div>
              </Link>
              
              <Link href="/certificate-guide">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">📖</span>
                  <span className="text-white font-medium">Certificate Guide</span>
                </div>
              </Link>
              
              <div className="border-t border-white/10 my-2"></div>
              
              <Link href="/settings">
                <div 
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-white font-medium">Settings</span>
                </div>
              </Link>
              
              <div className="border-t border-white/10 mt-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-red-400 flex items-center space-x-3"
                >
                  <span className="text-lg">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}