import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Upload, Image, Music, Video, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/premium/location-picker";

export default function CreatePost() {
  // Check authentication status
  const { data: currentUser, isLoading: isAuthLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
    retry: false,
  });
  
  // Redirect to login if not authenticated
  if (!isAuthLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>

        <div className="text-center relative z-10 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
            <ArrowLeft className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-foreground font-bold text-2xl mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">You need to log in to create posts</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] text-white font-semibold hover:opacity-90 transition-opacity">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-[#FE3F5E]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#FE3F5E] rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("/api/community/posts", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      navigate("/");
    },
    onError: (error: any) => {
      console.log("Upload error details:", error);
      
      // Check if this is an upload limit error
      const isUploadLimitError = error.message && (
        error.message.includes("upload limit") || 
        error.message.includes("monthly limit") ||
        error.message.includes("subscription")
      );

      if (isUploadLimitError) {
        // Show upgrade prompt for upload limit errors
        toast({
          title: "Upload Limit Reached",
          description: (
            <div className="space-y-3">
              <p>You've reached your monthly upload limit. Upgrade your subscription to upload more works.</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/subscription-management")}
                  className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Upgrade Now
                </button>
                <span className="text-xs text-muted-foreground">Starting at $19/month</span>
              </div>
            </div>
          ),
          variant: "destructive",
          duration: 8000, // Show longer for upgrade prompts
        });
      } else {
        // Show standard error for other failures
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to create post. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your post",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("location", location.trim());
    formData.append("isProtected", "false"); // Community posts are not protected
    
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    createPostMutation.mutate(formData);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8" />;
    
    if (selectedFile.type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (selectedFile.type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (selectedFile.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 md:pt-20 pb-20 md:pb-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-2xl mx-auto px-4 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm md:text-base">Back to Feed</span>
            </button>
          </Link>
          <div className="w-px h-6 bg-border"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Create Post</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="text-foreground font-medium mb-2 block">Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a catchy title..."
                className="bg-input border-border text-foreground placeholder-muted-foreground rounded-xl"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-foreground font-medium mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the community about your creation... Use #hashtags and @mentions"
                className="bg-input border-border text-foreground placeholder-muted-foreground rounded-xl min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-muted-foreground text-sm mt-1">
                {description.length}/500 characters • Use #hashtags and @username for mentions
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="text-foreground font-medium mb-2 block">Location (Optional)</label>
              <LocationPicker
                selectedLocation={location}
                onLocationSelect={setLocation}
                placeholder="Where did you create this? (e.g., Soho, NYC)"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-foreground font-medium mb-2 block">Media (Optional)</label>
              
              {!selectedFile ? (
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-border/60 transition-colors">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground">
                        {getFileIcon()}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Upload Media</p>
                        <p className="text-muted-foreground text-sm">
                          Images, audio, video, or documents
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-muted-foreground">
                      {getFileIcon()}
                    </div>
                    <div>
                      <p className="text-foreground font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            {previewUrl && selectedFile?.type.startsWith('image/') && (
              <div>
                <label className="text-foreground font-medium mb-2 block">Preview</label>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-xl border border-border"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 md:justify-end">
            <Link href="/">
              <Button
                type="button"
                variant="ghost"
                className="w-full md:w-auto text-muted-foreground hover:text-foreground hover:bg-muted/20"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || !title.trim()}
              className="w-full md:w-auto accent-button"
            >
              {createPostMutation.isPending ? "Posting..." : "Share Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}