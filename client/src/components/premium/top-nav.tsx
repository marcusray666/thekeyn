import { Link, useLocation } from "wouter";
import { Search, Menu, Plus, Bell } from "lucide-react";
import { useState } from "react";
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

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
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
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Link href="/upload">
          <Button className="accent-button">
            <Plus className="h-5 w-5 mr-2" />
            Upload
          </Button>
        </Link>
        
        <Button className="glass-button p-3">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="creator-avatar"
          >
            <div className="avatar-inner">
              {(user as any)?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl py-2 shadow-2xl">
              <Link href="/profile">
                <div className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                  <span className="text-white font-medium">Profile</span>
                </div>
              </Link>
              <Link href="/settings">
                <div className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                  <span className="text-white font-medium">Settings</span>
                </div>
              </Link>
              <div className="border-t border-white/10 mt-2">
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}