import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildMediaUrl } from "@/utils/media";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "certificate_approved";
  title: string;
  message: string;
  seen: boolean;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  post?: {
    id: number;
    title?: string;
  };
}

export function NotificationsBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => apiRequest("/api/notifications"),
    enabled: !!user,
  });

  const markAsSeenMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest(`/api/notifications/${notificationId}/mark-seen`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllSeenMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/notifications/mark-all-seen", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (!user) return null;

  const unseenNotifications = notifications.filter((n: Notification) => !n.seen);
  const unseenCount = unseenNotifications.length;
  const recentNotifications = notifications.slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like": return "❤️";
      case "comment": return "💬";
      case "follow": return "👤";
      case "certificate_approved": return "✅";
      default: return "🔔";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-3 rounded-full relative">
          <Bell className="h-5 w-5" />
          {unseenCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-xs">
              {unseenCount > 9 ? "9+" : unseenCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unseenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllSeenMutation.mutate()}
              className="text-xs text-primary hover:text-primary/80"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          recentNotifications.map((notification: Notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-0 cursor-pointer"
              onClick={() => {
                if (!notification.seen) {
                  markAsSeenMutation.mutate(notification.id);
                }
              }}
            >
              <div className={`w-full p-3 flex items-start gap-3 ${
                !notification.seen ? 'bg-primary/5' : ''
              }`}>
                <div className="flex-shrink-0">
                  {notification.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={notification.user.avatar ? buildMediaUrl(notification.user.avatar) : undefined}
                      />
                      <AvatarFallback className="text-xs">
                        {notification.user.displayName?.[0] || notification.user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                
                {!notification.seen && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        
        <Link href="/notifications">
          <DropdownMenuItem className="justify-center text-primary cursor-pointer">
            View All Notifications
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}