import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, Music, Image, Video, X, ArrowLeft, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    creatorName: "",
    description: "",
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

  const handleContinueToAuth = () => {
    if (!selectedFile || !formData.title || !formData.creatorName) {
      toast({
        title: "Missing information",
        description: "Please upload a file and fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    // Store the upload data temporarily
    const uploadData = {
      file: {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      },
      formData,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('pendingUpload', JSON.stringify(uploadData));
    
    toast({
      title: "Upload ready",
      description: "Please sign in or create an account to complete the upload.",
    });
    
    setLocation('/login');
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
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="logo-glass w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Upload Your Work</h1>
            <p className="text-gray-400">Try Prooff by uploading a file and seeing how protection works</p>
          </div>

          {/* Auth Notice */}
          <GlassCard variant="purple" className="p-4 mb-6">
            <div className="flex items-center space-x-2 text-white">
              <Upload className="h-5 w-5" />
              <div>
                <p className="font-medium">Demo Mode</p>
                <p className="text-sm text-gray-300">
                  Fill out the form to see how the upload process works. You'll need to sign in to complete the protection.
                </p>
              </div>
            </div>
          </GlassCard>

          <form className="space-y-6">
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
                      <div className="text-purple-400">
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
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleContinueToAuth}
                className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
              >
                <Upload className="mr-2 h-5 w-5" />
                Continue to Sign In
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() => setLocation('/login')}
                  variant="outline"
                  className="glass-morphism py-3 rounded-2xl font-semibold text-white hover:bg-opacity-80"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  type="button"
                  onClick={() => setLocation('/register')}
                  variant="outline"
                  className="glass-morphism py-3 rounded-2xl font-semibold text-white hover:bg-opacity-80"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </div>
            </div>
          </form>

          {/* Back to Welcome */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Welcome
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}