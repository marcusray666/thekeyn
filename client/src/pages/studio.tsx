import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Crown, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Studio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("/api/works", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your work has been protected and verified on the blockchain.",
      });
      setFile(null);
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Creative Studio</h1>
        <p className="text-gray-400">Protect your digital creations with blockchain verification</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Upload & Protect Your Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="file" className="text-white">Choose File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-gray-900 border-gray-600 text-white"
                accept="image/*,video/*,audio/*,.pdf"
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your work"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your work (optional)"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            <Button 
              type="submit" 
              disabled={!file || !title || uploadMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {uploadMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Protect My Work
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
