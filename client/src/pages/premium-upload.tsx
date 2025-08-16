import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Check, Download, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PremiumUpload() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    creatorName: user?.username || "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/works', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
      setStep('success');
      toast({
        title: "Work Protected!",
        description: "Your digital asset is now secured on the blockchain",
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setStep('upload');
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      
      // Auto-fill title with filename (without extension)
      const title = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({
        ...prev,
        title: title || file.name
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (!selectedFile || !formData.title || !formData.creatorName) {
      toast({
        title: "Missing Information",
        description: "Please upload a file and fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('title', formData.title);
    data.append('creatorName', formData.creatorName);
    data.append('description', formData.description);

    setStep('processing');
    uploadMutation.mutate(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setFormData({
      title: "",
      creatorName: user?.username || "",
      description: "",
    });
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 relative overflow-hidden light-theme">
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLocation('/');
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Feed</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800">
            {step === 'upload' && 'Protect Your Work'}
            {step === 'processing' && 'Securing on Blockchain...'}
            {step === 'success' && 'Protected Successfully!'}
          </h1>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-8">
              <div
                className={`upload-zone ${isDragging ? 'border-[#FE3F5E] bg-[#FE3F5E]/5' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#FE3F5E] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedFile.name}
                    </h3>
                    <p className="text-white/50 mb-4">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, title: "" }));
                      }}
                      className="glass-button"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-16 w-16 text-white/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Drag & drop your file here
                    </h3>
                    <p className="text-white/50 mb-4">
                      or click to browse files
                    </p>
                    <Button className="secondary-button">
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
              />

              {selectedFile && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-white font-medium">
                      Work Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the title of your work"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="creatorName" className="text-white font-medium">
                      Creator Name *
                    </Label>
                    <Input
                      id="creatorName"
                      name="creatorName"
                      value={formData.creatorName}
                      onChange={handleChange}
                      placeholder="Your name or artist name"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your work..."
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="accent-button w-full"
                    disabled={!formData.title || !formData.creatorName}
                  >
                    Protect My Work
                  </Button>
                </div>
              )}

              <div className="text-center text-white/50 text-sm">
                Supported: Images, Videos, Audio, Documents (Max 2GB)
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center animate-pulse">
                <Upload className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Creating your certificate...
                </h3>
                <p className="text-white/50">
                  Generating hash and anchoring to blockchain
                </p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Work Protected!
                </h3>
                <p className="text-white/50">
                  Your digital asset is now secured on the blockchain
                </p>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/50">File:</span>
                  <span className="text-white font-medium">{selectedFile?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Title:</span>
                  <span className="text-white font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Creator:</span>
                  <span className="text-white font-medium">{formData.creatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Blockchain:</span>
                  <span className="text-white">Ethereum + Bitcoin</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setLocation('/certificates')}
                  className="accent-button flex-1"
                >
                  <Download className="h-5 w-5 mr-2" />
                  View Certificate
                </Button>
                <Button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `Protected: ${formData.title}`,
                        text: `I just protected my work "${formData.title}" on the blockchain using Loggin'!`,
                        url: window.location.origin
                      });
                    }
                  }}
                  className="glass-button flex-1"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>

              <div
                onClick={() => setLocation('/')}
                className="w-full glass-button cursor-pointer text-center py-3 rounded-xl transition-colors flex items-center justify-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLocation('/');
                  }
                }}
              >
                Back to Feed
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}