import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid3X3, 
  LayoutGrid, 
  Play, 
  Pause, 

  Maximize2,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,

  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type { Work } from "@shared/schema";

// Helper function to get file type from MIME type
const getFileTypeFromMimeType = (mimeType: string): 'image' | 'audio' | 'video' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

interface AnimatedShowcaseProps {
  works: Work[];
  viewMode: 'grid' | 'masonry' | 'carousel' | 'timeline';
  onViewModeChange: (mode: 'grid' | 'masonry' | 'carousel' | 'timeline') => void;
  autoplay?: boolean;
  interactive?: boolean;
}

export function AnimatedShowcase({ 
  works, 
  viewMode, 
  onViewModeChange,
  autoplay = false,
  interactive = true
}: AnimatedShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Filter and sort works with proper null checks and field mapping
  const filteredWorks = works
    .filter(work => {
      const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (work.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (work.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const fileType = work.mimeType?.startsWith('image/') ? 'image' : 
                      work.mimeType?.startsWith('video/') ? 'video' :
                      work.mimeType?.startsWith('audio/') ? 'audio' : 'document';
      const matchesFilter = filterType === "all" || fileType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.likeCount || 0) - (a.likeCount || 0);
        case "views":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default: // recent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying && viewMode === 'carousel' && filteredWorks.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredWorks.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, viewMode, filteredWorks.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredWorks.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredWorks.length) % filteredWorks.length);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🎨';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      case 'document': return '📄';
      default: return '📁';
    }
  };

  const renderWorkCard = (work: Work, index: number) => (
    <motion.div
      key={work.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => setSelectedWork(work)}
    >
      <GlassCard className="overflow-hidden hover:scale-105 transition-transform duration-300">
        {/* Work Preview */}
        <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20 overflow-hidden">
          {work.filename && getFileTypeFromMimeType(work.mimeType) === 'image' ? (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Eye className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-400">Protected Preview</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {getFileTypeIcon(getFileTypeFromMimeType(work.mimeType))}
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center text-white">
              <Maximize2 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">View Details</p>
            </div>
          </div>
          
          {/* Featured badge */}
          {false && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500 text-black">Featured</Badge>
            </div>
          )}
          
          {/* File type badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-gray-800/80 text-white">
              {getFileTypeFromMimeType(work.mimeType).toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Work Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white mb-2 truncate">{work.title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{work.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(work.tags || []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                #{tag}
              </Badge>
            ))}
            {(work.tags || []).length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                +{(work.tags || []).length - 3}
              </Badge>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{work.likeCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{work.viewCount || 0}</span>
              </div>
            </div>
            <span>{formatTimeAgo(work.createdAt.toISOString())}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderGridView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {filteredWorks.map((work, index) => renderWorkCard(work, index))}
      </AnimatePresence>
    </motion.div>
  );

  const renderMasonryView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
    >
      <AnimatePresence>
        {filteredWorks.map((work, index) => (
          <div key={work.id} className="break-inside-avoid mb-6">
            {renderWorkCard(work, index)}
          </div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const renderCarouselView = () => (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {filteredWorks[currentIndex] && renderWorkCard(filteredWorks[currentIndex], 0)}
        </motion.div>
      </AnimatePresence>
      
      {/* Carousel Controls */}
      <div className="flex items-center justify-center mt-6 space-x-4">
        <Button variant="outline" size="sm" onClick={prevSlide} className="border-gray-600">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="border-gray-600"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" size="sm" onClick={nextSlide} className="border-gray-600">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Slide indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {filteredWorks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-purple-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <AnimatePresence>
        {filteredWorks.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center ${
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Timeline line */}
            <div className="hidden lg:flex flex-col items-center mx-8">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              {index < filteredWorks.length - 1 && (
                <div className="w-px h-16 bg-gradient-to-b from-purple-500 to-transparent mt-2"></div>
              )}
            </div>
            
            {/* Work card */}
            <div className="flex-1 max-w-md">
              {renderWorkCard(work, index)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      {interactive && (
        <GlassCard>
          <div className="p-4 space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search works..."
                  className="glass-input pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* View mode toggles */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className={viewMode === 'grid' ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange('masonry')}
                  className={viewMode === 'masonry' ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Masonry
                </Button>
                <Button
                  variant={viewMode === 'carousel' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange('carousel')}
                  className={viewMode === 'carousel' ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Carousel
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange('timeline')}
                  className={viewMode === 'timeline' ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
              </div>
              
              <div className="text-sm text-gray-400">
                {filteredWorks.length} works
              </div>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* Showcase content */}
      <div className="min-h-[400px]">
        {filteredWorks.length === 0 ? (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No works found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'masonry' && renderMasonryView()}
            {viewMode === 'carousel' && renderCarouselView()}
            {viewMode === 'timeline' && renderTimelineView()}
          </>
        )}
      </div>
      
      {/* Work detail modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => setSelectedWork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="max-w-2xl w-full mx-auto my-auto"
            >
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedWork.title}</h2>
                      <p className="text-gray-400">{selectedWork.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWork(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white ml-2">{getFileTypeFromMimeType(selectedWork.mimeType)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white ml-2">{formatTimeAgo(selectedWork.createdAt.toISOString())}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Likes:</span>
                      <span className="text-white ml-2">{selectedWork.likeCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white ml-2">{selectedWork.viewCount || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(selectedWork.tags || []).map((tag) => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button className="btn-glass">
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="outline" className="border-gray-600">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" className="border-gray-600">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}