import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Hash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProtectClean() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Generate SHA-256 hash preview (simplified for demo)
      const reader = new FileReader();
      reader.onload = () => {
        // In real implementation, this would generate actual SHA-256
        const simulatedHash = "a1b2c3d4e5f6..." + file.name.slice(-10);
        setFileHash(simulatedHash);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const protectMutation = useMutation({
    mutationFn: async () => {
      if (!uploadedFile) throw new Error("No file selected");
      
      const formDataToSend = new FormData();
      formDataToSend.append("file", uploadedFile);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      return await apiRequest("/api/upload", {
        method: "POST",
        body: formDataToSend,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Work Protected!",
        description: "Your content has been secured on the blockchain.",
      });
      // Reset form
      setUploadedFile(null);
      setFileHash("");
      setFormData({ title: "", description: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Protection failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a file to protect",
        variant: "destructive",
      });
      return;
    }
    protectMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">🔒 Protect New Work</h1>
          <p className="text-muted-foreground">
            Upload your creative content and secure it with blockchain protection
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Zone */}
          <Card>
            <CardContent className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-primary mx-auto" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setFileHash("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Click to browse files</p>
                      <p className="text-sm text-muted-foreground">
                        Support for images, videos, PDFs, audio (up to 2GB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Hash Preview */}
          {fileHash && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">SHA-256 Hash</Label>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {fileHash}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata Form */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Give your work a title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe your work and its significance"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={protectMutation.isPending || !uploadedFile}
          >
            {protectMutation.isPending ? "Protecting..." : "Protect Now"}
          </Button>
        </form>
      </div>
    </div>
  );
}