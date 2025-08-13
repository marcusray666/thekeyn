import { useState } from "react";
import { Upload, X, MapPin, Eye, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { buildMediaUrl, handleImageError } from "@/utils/media";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProtectedWork {
  id: number;
  title: string;
  type: string;
  mediaUrl?: string;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [attachedWork, setAttachedWork] = useState<string>("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's protected works for attachment
  const { data: protectedWorks = [] } = useQuery({
    queryKey: ["/api/user/protected-works"],
    queryFn: () => apiRequest("/api/user/protected-works"),
    enabled: open,
  });

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("/api/community-posts", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post shared!",
        description: "Your post has been shared to the community.",
      });
      resetForm();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setMediaFile(null);
    setMediaPreview("");
    setAttachedWork("");
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title.trim() && !description.trim()) {
      toast({
        title: "Missing content",
        description: "Please add a title or description for your post.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (location) formData.append("location", location);
    if (mediaFile) formData.append("media", mediaFile);
    if (attachedWork) formData.append("protectedWorkId", attachedWork);

    createPostMutation.mutate(formData);
  };

  const isValid = title.trim().length > 0 || description.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Share to Community</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your post a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description 
              <span className="text-sm text-muted-foreground ml-2">
                Use #hashtags and @mentions
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Share your thoughts, process, or story behind this work..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (optional)
            </Label>
            <Input
              id="location"
              placeholder="Where was this created?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media (optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:border-muted-foreground/50 transition-colors">
              {mediaPreview ? (
                <div className="relative">
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                    onError={handleImageError}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview("");
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div>
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="media-upload" className="cursor-pointer">
                        Choose file
                      </label>
                    </Button>
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attach Protected Work */}
          {protectedWorks.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Attach Protected Work (optional)
              </Label>
              <Select value={attachedWork} onValueChange={setAttachedWork}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a protected work to showcase" />
                </SelectTrigger>
                <SelectContent>
                  {protectedWorks.map((work: ProtectedWork) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">🛡️</span>
                        <span>{work.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ({work.type})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {!isValid && "Add content to enable sharing"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || createPostMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share Post"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}