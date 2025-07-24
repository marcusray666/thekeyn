import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Work {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  collaborators?: string[];
  originalName: string;
  mimeType: string;
  fileSize: number;
  certificateId: string;
  createdAt: string;
}

interface EditWorkDialogProps {
  work: Work;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkDialog({ work, open, onOpenChange }: EditWorkDialogProps) {
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description || "");
  const [creatorName, setCreatorName] = useState(work.creatorName);
  const [collaborators, setCollaborators] = useState<string[]>(work.collaborators || []);
  const [newCollaborator, setNewCollaborator] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; creatorName: string; collaborators: string[] }) => {
      return await apiRequest(`/api/works/${work.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Work updated!",
        description: "Your work details have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-works"] });
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Unable to update work. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !creatorName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and creator name.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      creatorName: creatorName.trim(),
      collaborators: collaborators.filter(c => c.trim()),
    });
  };

  const addCollaborator = () => {
    if (newCollaborator.trim() && !collaborators.includes(newCollaborator.trim())) {
      setCollaborators([...collaborators, newCollaborator.trim()]);
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-gray-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Work Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Work Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-morphism border-gray-600 text-white placeholder-gray-400"
              placeholder="Enter work title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creator" className="text-white">Creator Name *</Label>
            <Input
              id="creator"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="glass-morphism border-gray-600 text-white placeholder-gray-400"
              placeholder="Enter creator name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-morphism border-gray-600 text-white placeholder-gray-400"
              placeholder="Enter work description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Collaborators</Label>
            <div className="flex gap-2">
              <Input
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                onKeyPress={handleKeyPress}
                className="glass-morphism border-gray-600 text-white placeholder-gray-400"
                placeholder="Add collaborator name/email"
              />
              <Button
                type="button"
                onClick={addCollaborator}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:border-purple-500"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {collaborators.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {collaborators.map((collaborator, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                  >
                    {collaborator}
                    <button
                      type="button"
                      onClick={() => removeCollaborator(index)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">
              Add people who collaborated on this work to share ownership
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-glass px-6"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}