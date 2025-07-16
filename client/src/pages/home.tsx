import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Upload, Link as LinkIcon, Gavel, Plus, Tag, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/works", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your work has been registered and certificate generated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      
      // Reset form
      setFiles(null);
      setTitle("");
      setDescription("");
      setCreatorName("");
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and register your work.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files || files.length === 0) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title || !creatorName) {
      toast({
        title: "Missing Information", 
        description: "Please provide both title and creator name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("creatorName", creatorName);

    uploadMutation.mutate(formData);
  };

  const features = [
    {
      icon: Upload,
      title: "Upload Instantly",
      description: "Upload your art, music, or designs and create a digital certificate within seconds.",
      variant: "purple" as const,
    },
    {
      icon: LinkIcon,
      title: "Blockchain Proof",
      description: "Every work is timestamped and anchored to the blockchain for permanent verification.",
      variant: "pink" as const,
    },
    {
      icon: Shield,
      title: "Share Everywhere",
      description: "Share certificates as PDF, QR code, or secure link for legal protection.",
      variant: "orange" as const,
    },
    {
      icon: Gavel,
      title: "Enforce Rights",
      description: "Generate takedown notices for platforms like Instagram, YouTube, and TikTok.",
      variant: "teal" as const,
    },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard floating className="p-8 md:p-12 mb-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Protect. Create.</span><br/>
              <span className="text-white">Own Your Art.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Instantly secure, prove, and defend your creative work with blockchain-powered certificates. 
              Right from your phone or browser.
            </p>
            
            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  placeholder="Work Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
                  required
                />
                <Input
                  placeholder="Creator Name *"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-gray-400"
                rows={3}
              />
              
              <FileUpload
                onFileSelect={setFiles}
                multiple={false}
              />
              
              <Button
                type="submit"
                className="btn-glass px-8 py-4 rounded-2xl font-semibold text-white text-lg"
                disabled={isUploading}
              >
                <Shield className="mr-2 h-5 w-5" />
                {isUploading ? "Creating Tag..." : "Create Tag Now"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            How Prooff Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                variant={feature.variant}
                floating
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  feature.variant === 'purple' ? 'from-purple-500 to-purple-600' :
                  feature.variant === 'pink' ? 'from-pink-500 to-pink-600' :
                  feature.variant === 'orange' ? 'from-orange-500 to-orange-600' :
                  feature.variant === 'teal' ? 'from-teal-500 to-teal-600' :
                  feature.variant === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                  'from-emerald-500 to-emerald-600'
                } flex items-center justify-center mb-4 mx-auto`}>
                  <feature.icon className="text-2xl text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-8 md:p-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Ready to Protect</span><br/>
              <span className="text-white">Your Creative Work?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust Prooff to secure their digital assets with blockchain technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button className="btn-glass px-8 py-4 rounded-2xl font-semibold text-white text-lg">
                <Plus className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                variant="outline"
                className="glass-morphism px-8 py-4 rounded-2xl font-semibold text-white text-lg hover:bg-opacity-80 transition-all"
              >
                <Tag className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Works Everywhere</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
