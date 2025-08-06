import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  ArrowLeft, 
  User,
  UserPlus,
  UserCheck,
  MessageCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  followerCount: number;
  followingCount: number;
  workCount: number;
  isFollowing: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

export default function Social() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "creators">("all");
  const { isAuthenticated } = useAuth();

  // Fetch users/creators
  const { data: users, isLoading } = useQuery<UserProfile[]>({
    queryKey: ["/api/users/discover"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
            </div>
            <p className="text-white/60 text-sm">Finding creators...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no data state if no users found
  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="w-full max-w-4xl mx-auto px-4 relative z-10 pt-24 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => setLocation('/messages')}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Messages
            </Button>
            <h1 className="text-2xl font-bold text-white">Find People</h1>
            <div></div>
          </div>

          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Users Found</h3>
              <p className="text-white/60 text-sm mb-6">Try adjusting your search or check back later for new creators.</p>
              <Button 
                onClick={() => setLocation('/dashboard')} 
                className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-6 py-3 rounded-xl border-0"
              >
                Explore Community Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "online") return matchesSearch && user.isOnline;
    if (filter === "creators") return matchesSearch && user.workCount > 0;
    return matchesSearch;
  });

  const followUser = (userId: number) => {
    // Here you would typically send a follow request via API
    console.log('Following user:', userId);
  };

  const messageUser = async (userId: number) => {
    try {
      // Start a conversation with the user
      const response = await fetch('/api/messages/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ recipientId: userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to messages with the conversation ID
        setLocation(`/messages?conversation=${data.conversationId}&user=${userId}`);
      } else {
        console.error('Failed to start conversation');
        // Fallback to just navigating to messages
        setLocation('/messages');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setLocation('/messages');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden pb-20">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-4xl mx-auto px-4 relative z-10 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setLocation('/messages')}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Button>
          <h1 className="text-2xl font-bold text-white">Find People</h1>
          <div></div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                placeholder="Search creators by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/20 backdrop-blur-sm border-white/10 text-white placeholder:text-white/50 h-12"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                className={filter === "all" 
                  ? "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }
              >
                All Users
              </Button>
              <Button
                onClick={() => setFilter("online")}
                variant={filter === "online" ? "default" : "ghost"}
                size="sm"
                className={filter === "online" 
                  ? "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }
              >
                Online Now
              </Button>
              <Button
                onClick={() => setFilter("creators")}
                variant={filter === "creators" ? "default" : "ghost"}
                size="sm"
                className={filter === "creators" 
                  ? "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }
              >
                Active Creators
              </Button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div 
                  className="relative mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLocation(`/user/${user.id}`)}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-full flex items-center justify-center border border-white/10 hover:border-[#FE3F5E]/30 transition-colors">
                    <User className="h-8 w-8 text-white/70" />
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0F0F0F]"></div>
                  )}
                </div>

                {/* User Info */}
                <h3 
                  className="text-lg font-semibold text-white mb-1 hover:text-[#FE3F5E] transition-colors cursor-pointer"
                  onClick={() => setLocation(`/user/${user.id}`)}
                >
                  {user.displayName}
                </h3>
                <p 
                  className="text-white/60 text-sm mb-2 hover:text-[#FE3F5E] transition-colors cursor-pointer"
                  onClick={() => setLocation(`/user/${user.id}`)}
                >
                  @{user.username}
                </p>
                
                {user.bio && (
                  <p className="text-white/50 text-xs mb-4 line-clamp-2">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="flex gap-4 mb-4 text-xs text-white/60">
                  <span>{user.followerCount} followers</span>
                  <span>{user.workCount} works</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => followUser(user.id)}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${
                      user.isFollowing 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white"
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => messageUser(user.id)}
                    variant="ghost"
                    size="sm"
                    className="bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-500/20 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-white/60 text-sm">Try searching with different keywords or browse all users.</p>
          </div>
        )}
      </div>
    </div>
  );
}