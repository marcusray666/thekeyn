import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildMediaUrl } from "@/utils/media";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Notifications query for badge
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", { unseen: true }],
    queryFn: () => apiRequest("/api/notifications?unseen=true"),
    enabled: !!user,
  });

  if (!user) return null;

  const unseenCount = notifications.filter((n: any) => !n.seen).length;

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: location === "/" || location === "/home" || location === "/dashboard",
    },
    {
      href: "/explore",
      icon: Search,
      label: "Explore",
      active: location === "/explore" || location.startsWith("/search"),
    },
    {
      href: "/create-post",
      icon: Plus,
      label: "Post",
      active: location === "/create-post",
      isCenter: true,
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Inbox",
      active: location === "/messages",
      badge: unseenCount > 0 ? unseenCount : undefined,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      active: location === "/profile" || location.startsWith("/profile/"),
      isProfile: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                >
                  <Icon className="h-6 w-6" />
                </Button>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`flex flex-col items-center justify-center p-3 min-w-[60px] transition-colors ${
                  item.active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  {item.isProfile ? (
                    <Avatar className={`h-6 w-6 ${item.active ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      <AvatarImage src={user.avatar ? buildMediaUrl(user.avatar) : undefined} />
                      <AvatarFallback className="text-xs">
                        {user.displayName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                  
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-xs">
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}