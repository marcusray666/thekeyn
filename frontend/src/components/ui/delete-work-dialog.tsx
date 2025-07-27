import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Work {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  certificateId: string;
  createdAt: string;
}

interface DeleteWorkDialogProps {
  work: Work;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkDialog({ work, open, onOpenChange }: DeleteWorkDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/works/${work.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Work deleted",
        description: `"${work.title}" has been permanently removed from your portfolio.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-works"] });
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Unable to delete work. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism border-gray-600 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Delete Work
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            This action cannot be undone. This will permanently delete your work and its certificate.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 my-4">
          <h4 className="text-white font-medium mb-2">You are about to delete:</h4>
          <div className="space-y-1 text-sm text-gray-300">
            <p><span className="font-medium">Title:</span> {work.title}</p>
            <p><span className="font-medium">Creator:</span> {work.creatorName}</p>
            <p><span className="font-medium">File:</span> {work.originalName}</p>
            <p><span className="font-medium">Certificate ID:</span> {work.certificateId}</p>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
          <p className="text-amber-200 text-sm">
            <strong>Warning:</strong> The associated blockchain certificate will also be invalidated. 
            Any existing verification links will no longer work.
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
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}