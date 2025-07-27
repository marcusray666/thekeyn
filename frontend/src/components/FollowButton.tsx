import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  followersCount: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export default function FollowButton({
  userId,
  isFollowing,
  followersCount,
  className = "",
  size = "default",
  variant = "default"
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return await apiRequest(`/api/social/users/${userId}/follow`, {
          method: "DELETE",
        });
      } else {
        return await apiRequest(`/api/social/users/${userId}/follow`, {
          method: "POST",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/users/${userId}/followers`] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/users/${userId}/following`] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/users/${userId}/follow-stats`] });
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this user"
          : "You are now following this user",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isFollowing 
          ? "Failed to unfollow user"
          : "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    followMutation.mutate();
  };

  const getButtonText = () => {
    if (followMutation.isPending) {
      return isFollowing ? "Unfollowing..." : "Following...";
    }
    
    if (isFollowing) {
      return isHovered ? "Unfollow" : "Following";
    }
    
    return "Follow";
  };

  const getButtonIcon = () => {
    if (isFollowing) {
      return isHovered ? <UserMinus className="h-4 w-4" /> : <Users className="h-4 w-4" />;
    }
    return <UserPlus className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return isHovered ? "destructive" : "secondary";
    }
    return variant;
  };

  return (
    <Button
      onClick={handleClick}
      disabled={followMutation.isPending}
      size={size}
      variant={getButtonVariant()}
      className={`
        ${className}
        ${isFollowing && !isHovered ? "bg-green-500/20 text-green-400 border-green-500/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20" : ""}
        ${!isFollowing ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none" : ""}
        transition-all duration-200
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getButtonIcon()}
      <span className="ml-2">{getButtonText()}</span>
      {followersCount > 0 && (
        <span className="ml-2 text-xs opacity-70">
          ({followersCount})
        </span>
      )}
    </Button>
  );
}