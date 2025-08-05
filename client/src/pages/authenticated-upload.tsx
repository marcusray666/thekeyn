import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Music, Image, Video, X, ArrowLeft, Shield, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function AuthenticatedUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    creatorName: user?.username || "",
    description: "",
    collaborators: [] as string[]
  });
  const [newCollaborator, setNewCollaborator] = useState("");

  // Check for pending upload data when component mounts
  useEffect(() => {
    const pendingUpload = localStorage.getItem('pendingUpload');
    if (pendingUpload) {
      try {
        const uploadData = JSON.parse(pendingUpload);
        const { formData: pendingFormData } = uploadData;
        
        // Restore form data
        setFormData(prev => ({
          ...prev,
          title: pendingFormData.title || "",
          description: pendingFormData.description || "",
          creatorName: user?.username || pendingFormData.creatorName || "",
        }));

        // Clear the pending upload data since we've restored it
        localStorage.removeItem('pendingUpload');
        
        toast({
          title: "Upload data restored",
          description: "Your upload information has been restored. Please select your file again to continue.",
        });
      } catch (error) {
        console.error('Error restoring pending upload:', error);
        localStorage.removeItem('pendingUpload');
      }
    }
  }, [user, toast]);

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log('Starting upload mutation with FormData:', {
        hasFile: data.has('file'),
        title: data.get('title'),
        creatorName: data.get('creatorName'),
        description: data.get('description'),
      });

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        const response = await fetch('/api/works', {
          method: 'POST',
          body: data,
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Upload timed out. Please try again with a smaller file.');
        }
        throw error;
      }
      
      console.log('Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload error data:', errorData);
        throw new Error(errorData.error || `${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Upload success result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Upload mutation success:', data);
      toast({
        title: "Work protected successfully!",
        description: `Certificate ID: ${data.certificate?.certificateId || data.certificateId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/works'] });
      setLocation('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload and protect your work.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList) => {
    const file = files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title with filename (without extension)
      const title = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({
        ...prev,
        title: title || file.name
      }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, title: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addCollaborator = () => {
    if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator.trim())) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaborator.trim()]
      }));
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.creatorName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', selectedFile);
    uploadData.append('title', formData.title);
    uploadData.append('creatorName', formData.creatorName);
    uploadData.append('description', formData.description);
    uploadData.append('collaborators', JSON.stringify(formData.collaborators));

    uploadMutation.mutate(uploadData);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (file.type.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10 pt-24">
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-4">Loggin'</h1>
            <h2 className="text-2xl font-bold text-white mb-2">Protect Your Work</h2>
            <p className="text-gray-400">Upload your creative work to generate a blockchain certificate</p>
          </div>

          {/* Protection Info */}
          <GlassCard variant="emerald" className="p-4 mb-6">
            <div className="flex items-start space-x-3 text-white">
              <Shield className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Instant Protection</p>
                <p className="text-sm text-gray-300">
                  Your work will be secured with a blockchain certificate, providing legal proof of creation and ownership.
                </p>
              </div>
            </div>
          </GlassCard>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-white">Upload File</Label>
              {!selectedFile ? (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                  maxSize={500}
                  className="upload-zone rounded-2xl border-2 border-dashed p-8 text-center"
                />
              ) : (
                <div className="glass-morphism rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-emerald-400">
                        {getFileIcon(selectedFile)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-400 hover:bg-opacity-10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Work Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Work Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="glass-morphism border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter the title of your work"
                />
              </div>

              <div>
                <Label htmlFor="creatorName" className="text-white">
                  Creator Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="creatorName"
                  name="creatorName"
                  value={formData.creatorName}
                  onChange={handleChange}
                  required
                  className="glass-morphism border-gray-600 text-white placeholder-gray-400"
                  placeholder="Your name or artist name"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="glass-morphism border-gray-600 text-white placeholder-gray-400"
                  placeholder="Describe your work..."
                />
              </div>

              {/* Collaborators */}
              <div>
                <Label htmlFor="collaborators" className="text-white">
                  Collaborators (Optional)
                </Label>
                <p className="text-xs text-gray-400 mb-2">
                  Add people who worked on this project with you
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCollaborator();
                      }
                    }}
                    className="glass-morphism border-gray-600 text-white placeholder-gray-400"
                    placeholder="Collaborator name or email"
                  />
                  <Button
                    type="button"
                    onClick={addCollaborator}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-emerald-600 hover:border-emerald-500"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.collaborators.map((collaborator, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50"
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
              >
                {uploadMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Protecting your work...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Generate Certificate</span>
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="text-gray-400 hover:text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}