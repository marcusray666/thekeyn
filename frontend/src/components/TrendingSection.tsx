import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Hash, Users, Heart, MessageCircle, Eye, Clock, Filter, Award, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TrendingPost {
  id: string;
  userId: number;
  username: string;
  userImage?: string;
  content: string;
  imageUrl?: string;
  fileType?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  trendingScore: number;
  tags?: string[];
  certificateId?: string;
  isProtected?: boolean;
}

interface TrendingTag {
  tag: string;
  count: number;
  growth: number;
}

interface TrendingCreator {
  id: number;
  username: string;
  userImage?: string;
  followers: number;
  totalLikes: number;
  postsCount: number;
  growth: number;
  isVerified?: boolean;
}

export default function TrendingSection() {
  const [timeRange, setTimeRange] = useState("24h");
  const [category, setCategory] = useState("all");

  const { data: trendingPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/social/trending/posts", { timeRange, category }],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const { data: trendingTags, isLoading: tagsLoading } = useQuery({
    queryKey: ["/api/social/trending/tags", { timeRange }],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: trendingCreators, isLoading: creatorsLoading } = useQuery({
    queryKey: ["/api/social/trending/creators", { timeRange }],
    refetchInterval: 5 * 60 * 1000,
  });

  const timeRanges = [
    { value: "1h", label: "Last Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ];

  const categories = [
    { value: "all", label: "All Content" },
    { value: "digital_art", label: "Digital Art" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "video", label: "Video" },
    { value: "3d_models", label: "3D Models" },
  ];

  const getTrendingIcon = (score: number) => {
    if (score >= 90) return <Award className="h-4 w-4 text-yellow-400" />;
    if (score >= 70) return <Star className="h-4 w-4 text-purple-400" />;
    return <TrendingUp className="h-4 w-4 text-blue-400" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 50) return "text-green-400";
    if (growth >= 20) return "text-blue-400";
    if (growth >= 0) return "text-purple-400";
    return "text-gray-400";
  };

  if (postsLoading || tagsLoading || creatorsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse mb-2" />
                      <div className="w-1/2 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-full h-32 bg-white/10 rounded animate-pulse" />
                  <div className="flex justify-between">
                    <div className="w-1/4 h-4 bg-white/10 rounded animate-pulse" />
                    <div className="w-1/4 h-4 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Controls */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            Trending Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trending Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Posts */}
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-400" />
                Hot Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingPosts && trendingPosts.length > 0 ? (
                <div className="space-y-4">
                  {trendingPosts.map((post: TrendingPost, index: number) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-400">#{index + 1}</span>
                          {getTrendingIcon(post.trendingScore)}
                        </div>
                        
                        <Avatar className="w-10 h-10 border border-purple-500/20">
                          <AvatarImage src={post.userImage} alt={post.username} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {post.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{post.username}</span>
                            {post.isProtected && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                Protected
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {post.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No trending posts found for this time range</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Tags */}
          <Card className="backdrop-blur-xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-400" />
                Trending Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingTags && trendingTags.length > 0 ? (
                <div className="space-y-3">
                  {trendingTags.map((tag: TrendingTag, index: number) => (
                    <div key={tag.tag} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-400">#{index + 1}</span>
                        <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                          #{tag.tag}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">{tag.count}</div>
                        <div className={`text-xs ${getGrowthColor(tag.growth)}`}>
                          +{tag.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Hash className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">No trending tags</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Creators */}
          <Card className="backdrop-blur-xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                Trending Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingCreators && trendingCreators.length > 0 ? (
                <div className="space-y-3">
                  {trendingCreators.map((creator: TrendingCreator, index: number) => (
                    <div key={creator.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm font-bold text-green-400">#{index + 1}</span>
                      <Avatar className="w-8 h-8 border border-green-500/20">
                        <AvatarImage src={creator.userImage} alt={creator.username} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs">
                          {creator.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-white">{creator.username}</span>
                          {creator.isVerified && (
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{creator.followers} followers</span>
                          <span className={getGrowthColor(creator.growth)}>
                            +{creator.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">No trending creators</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}