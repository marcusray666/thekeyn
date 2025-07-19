import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  bio?: string;
  isVerified?: boolean;
}

export default function FollowersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('followers');

  // Only allow authenticated users to see their own followers/following
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ['/api/social/users', user?.id, 'followers'],
    enabled: !!user?.id && activeTab === 'followers',
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ['/api/social/users', user?.id, 'following'],
    enabled: !!user?.id && activeTab === 'following',
  });

  if (!user) {
    return null;
  }

  const handleUserClick = (username: string) => {
    setLocation(`/profile/${username}`);
  };

  const UserCard = ({ user: followerUser }: { user: User }) => (
    <Card className="glass-morphism p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => handleUserClick(followerUser.username)}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={followerUser.profileImageUrl} />
          <AvatarFallback className="bg-purple-600 text-white">
            {followerUser.displayName?.[0] || followerUser.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {followerUser.displayName || followerUser.username}
            </h3>
            {followerUser.isVerified && (
              <UserCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-400">@{followerUser.username}</p>
          {followerUser.bio && (
            <p className="text-sm text-gray-300 mt-1 line-clamp-2">{followerUser.bio}</p>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleUserClick(followerUser.username);
          }}
          className="glass-morphism border-purple-500/30 text-white hover:bg-purple-600/20"
        >
          View Profile
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-700/20 via-blue-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-700/20 via-purple-600/10 to-transparent blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-white">Connections</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-morphism border-purple-500/30 mb-8">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-4">
            <Card className="glass-morphism p-6">
              <h2 className="text-xl font-semibold text-white mb-4">People Following You</h2>
              {loadingFollowers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading followers...</p>
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No followers yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share your profile to connect with other creators
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower: User) => (
                    <UserCard key={follower.id} user={follower} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <Card className="glass-morphism p-6">
              <h2 className="text-xl font-semibold text-white mb-4">People You Follow</h2>
              {loadingFollowing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading following...</p>
                </div>
              ) : following.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Not following anyone yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Discover and follow other creators in the community
                  </p>
                  <Button 
                    onClick={() => setLocation('/social')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                  >
                    Explore Community
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {following.map((followedUser: User) => (
                    <UserCard key={followedUser.id} user={followedUser} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}