import { Link, useLocation } from "wouter";
import { Search, Bell, MessageCircle, Plus, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogoIcon } from "@/components/ui/logo-icon";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { buildMediaUrl } from "@/utils/media";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
}

export function NavBar() {
  const [, setLocation] = useLocation();
  const { user } = useAuth() as { user: User | null };
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search users query
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/users/search", debouncedSearch],
    queryFn: () => apiRequest(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length >= 2,
  });

  // Notifications query
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", { unseen: true }],
    queryFn: () => apiRequest("/api/notifications?unseen=true"),
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
  });

  const unseenCount = notifications.filter((n: any) => !n.seen).length;

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
              <LogoIcon className="w-8 h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Loggin'
              </span>
            </div>
          </Link>

          {/* Center Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-muted/50 border-transparent focus:bg-background"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-popover rounded-xl shadow-lg border border-border/50 z-50">
                {searchResults.slice(0, 5).map((result: any) => (
                  <Link key={result.id} href={`/profile/${result.username}`}>
                    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar ? buildMediaUrl(result.avatar) : undefined} />
                        <AvatarFallback className="text-xs">
                          {result.displayName?.[0] || result.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.displayName || result.username}</p>
                        <p className="text-sm text-muted-foreground truncate">@{result.username}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Create Post */}
                <Link href="/create-post">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="p-3 rounded-full">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="p-3 rounded-full relative">
                    <Bell className="h-5 w-5" />
                    {unseenCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-xs">
                        {unseenCount > 9 ? "9+" : unseenCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Theme Toggle */}
                <Button 
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  variant="ghost"
                  size="sm"
                  className="p-3 rounded-full"
                >
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>

                {/* Profile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar ? buildMediaUrl(user.avatar) : undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.displayName?.[0] || user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/certificates">
                      <DropdownMenuItem className="cursor-pointer">
                        My Certificates
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/analytics">
                      <DropdownMenuItem className="cursor-pointer">
                        Analytics
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/blockchain-verification">
                      <DropdownMenuItem className="cursor-pointer">
                        Blockchain Verification
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/studio">
                      <DropdownMenuItem className="cursor-pointer">
                        Studio (Upload)
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="cursor-pointer"
                    >
                      Theme: {theme === "light" ? "Light" : "Dark"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}