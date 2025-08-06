import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  User,
  UserPlus,
  UserCheck,
  MessageCircle,
  Settings,
  Calendar,
  MapPin,
  Link2,
  Award,
  Users,
  FileText,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  followerCount: number;
  followingCount: number;
  workCount: number;
  postCount: number;
  isFollowing: boolean;
  isOnline: boolean;
  lastSeen?: string;
  joinedDate: string;
  location?: string;
  website?: string;
  isVerified: boolean;
}

interface UserWork {
  id: number;
  title: string;
  filename: string;
  thumbnailUrl?: string;
  mimeType: string;
  createdAt: string;
  likes: number;
  views: number;
}

export default function UserProfilePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/user/:userId");
  const [activeTab, setActiveTab] = useState<"works" | "posts">("works");
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const userId = params?.userId ? parseInt(params.userId) : null;
  const isOwnProfile = currentUser && userId === currentUser.id;

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  // Fetch user works
  const { data: works, isLoading: loadingWorks } = useQuery<UserWork[]>({
    queryKey: ["/api/users", userId, "works"],
    enabled: !!userId,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: 'follow' | 'unfollow' }) => {
      return apiRequest(`/api/users/${userId}/${action}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
  });

  const handleFollowToggle = () => {
    if (!profile) return;
    
    const action = profile.isFollowing ? 'unfollow' : 'follow';
    followMutation.mutate({ userId: profile.id, action });
  };

  const startConversation = () => {
    if (!profile) return;
    setLocation(`/messages?user=${profile.id}&conversation=${Date.now()}`);
  };

  if (loadingProfile) {
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
            <p className="text-white/60 text-sm">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
        
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">User Not Found</h3>
            <p className="text-white/60 text-sm mb-8">The profile you're looking for doesn't exist or has been removed.</p>
            
            <Button 
              onClick={() => setLocation('/social')} 
              className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white font-semibold px-6 py-3 rounded-xl border-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Social
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setLocation('/social')}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-[#FE3F5E]/20 to-[#FFD200]/20 rounded-full flex items-center justify-center border border-white/10">
                {profile.profileImageUrl ? (
                  <img 
                    src={profile.profileImageUrl} 
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-white/70" />
                )}
              </div>
              {profile.isOnline && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0F0F0F]"></div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.displayName || profile.username}</h1>
                {profile.isVerified && (
                  <div className="bg-blue-500/20 px-2 py-1 rounded-full">
                    <Award className="h-4 w-4 text-blue-400" />
                  </div>
                )}
              </div>
              <p className="text-white/60 text-lg mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-white/80 mb-4 max-w-md">{profile.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <Link2 className="h-4 w-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#FE3F5E] transition-colors">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.workCount}</div>
                  <div className="text-sm text-white/50">Works</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.followerCount}</div>
                  <div className="text-sm text-white/50">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.followingCount}</div>
                  <div className="text-sm text-white/50">Following</div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                      profile.isFollowing
                        ? "bg-black/20 border border-white/10 text-white hover:bg-white/10"
                        : "bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] hover:from-[#FE3F5E]/90 hover:to-[#FF6B8A]/90 text-white border-0"
                    }`}
                  >
                    {profile.isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={startConversation}
                    className="bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 px-6 py-2 rounded-xl font-semibold"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <Button
                  onClick={() => setLocation('/settings')}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 px-6 py-2 rounded-xl font-semibold"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("works")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "works"
                  ? "text-[#FE3F5E] border-b-2 border-[#FE3F5E] bg-[#FE3F5E]/5"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="h-4 w-4 mr-2 inline" />
              Works ({profile.workCount})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "posts"
                  ? "text-[#FE3F5E] border-b-2 border-[#FE3F5E] bg-[#FE3F5E]/5"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart className="h-4 w-4 mr-2 inline" />
              Posts ({profile.postCount || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "works" && (
              <div>
                {loadingWorks ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#FE3F5E]/30 border-t-[#FE3F5E] rounded-full animate-spin"></div>
                  </div>
                ) : works && works.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {works.map((work) => (
                      <div
                        key={work.id}
                        className="bg-black/20 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                        onClick={() => setLocation(`/certificates/${work.id}`)}
                      >
                        <div className="aspect-square bg-gradient-to-br from-[#FE3F5E]/10 to-[#FFD200]/10 flex items-center justify-center">
                          {work.thumbnailUrl ? (
                            <img src={work.thumbnailUrl} alt={work.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-4xl">
                              {work.mimeType.startsWith('image/') ? '🎨' : 
                               work.mimeType.startsWith('audio/') ? '🎵' : 
                               work.mimeType.startsWith('video/') ? '🎬' : '📄'}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2 group-hover:text-[#FE3F5E] transition-colors">{work.title}</h3>
                          <div className="flex items-center justify-between text-sm text-white/50">
                            <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-3">
                              <span>{work.likes} ❤️</span>
                              <span>{work.views} 👁️</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No works uploaded yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Social posts coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}