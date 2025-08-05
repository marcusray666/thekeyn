import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const navigationItems = [
  { title: "Home", icon: Home, route: "/" },
  { title: "Protect Work", icon: Shield, route: "/protect" },
  { title: "Community", icon: Users, route: "/feed" },
  { title: "Certificates", icon: FileText, route: "/studio?tab=certificates" },
  { title: "Verify", icon: CheckCircle, route: "/verify" },
  { title: "Settings", icon: Settings, route: "/settings" },
];

export function SidebarNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden glass-card"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen w-64 glass-sidebar transition-transform duration-300 z-40",
        "bg-gradient-to-b from-[#0f2027]/90 via-[#203a43]/90 to-[#2c5364]/90",
        "backdrop-blur-xl border-r border-white/10",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-br from-[#9146FF] to-[#7C3AED] rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Loggin'</span>
              </div>
            </Link>
          </div>

          {/* User Profile */}
          <div className="mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9146FF] to-[#7C3AED] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {(user as any)?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{(user as any)?.username || "User"}</p>
                <p className="text-gray-400 text-sm capitalize">{(user as any)?.tier || "free"} tier</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.route || 
                (item.route === "/" && location === "/") ||
                (item.route.includes("studio") && location.includes("studio"));
              
              return (
                <Link key={item.route} href={item.route}>
                  <div className={cn(
                    "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200",
                    "hover:bg-white/10 hover:scale-105 cursor-pointer group",
                    isActive 
                      ? "bg-gradient-to-r from-[#9146FF]/20 to-[#7C3AED]/20 border border-[#9146FF]/30 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-[#9146FF]" : "text-gray-400 group-hover:text-white"
                    )} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start p-3 text-gray-300 hover:text-white hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}