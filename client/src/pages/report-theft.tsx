import { useState } from "react";
import { useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Twitter, 
  Instagram, 
  Facebook,
  Youtube,
  Linkedin,
  Send,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonLoader } from "@/components/ui/liquid-glass-loader";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const PLATFORMS = [
  { name: 'Twitter/X', icon: Twitter, color: 'text-blue-400', email: 'copyright@twitter.com' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-400', email: 'ip@instagram.com' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-600', email: 'ip@facebook.com' },
  { name: 'YouTube', icon: Youtube, color: 'text-red-500', email: 'copyright@youtube.com' },
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', email: 'copyright@linkedin.com' },
];

interface TheftReport {
  certificateId: string;
  platform: string;
  infringingUrl: string;
  description: string;
  contactEmail: string;
}

export default function ReportTheft() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    certificateId: '',
    platform: '',
    infringingUrl: '',
    description: '',
    contactEmail: '',
  });

  const [generatedEmail, setGeneratedEmail] = useState('');

  const [platformEmail, setPlatformEmail] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  const reportMutation = useMutation({
    mutationFn: async (data: TheftReport) => {
      return await apiRequest('/api/report-theft', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          certificateId: formData.certificateId || 'general-report'
        }),
      });
    },
    onSuccess: (data) => {
      setGeneratedEmail(data.emailTemplate);
      setPlatformEmail(data.platformEmail);
      setCertificateUrl(data.certificateUrl);
      toast({
        title: "Takedown request generated!",
        description: "Your DMCA takedown email has been prepared and is ready to send.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Report failed",
        description: error.message || "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.infringingUrl || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate({
      certificateId: formData.certificateId || 'general-report',
      ...formData,
    });
  };

  const handlePlatformSelect = (platform: string, email: string) => {
    setFormData(prev => ({
      ...prev,
      platform,
      contactEmail: email,
    }));
  };

  const copyEmailTemplate = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast({
      title: "Email copied!",
      description: "The takedown email has been copied to your clipboard.",
    });
  };

  const openEmailClient = () => {
    const subject = `Takedown Request – Unauthorized Use of Copyrighted Content`;
    const body = encodeURIComponent(generatedEmail);
    const mailto = `mailto:${platformEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(mailto);
  };

  const sendDirectEmail = async () => {
    // This would integrate with an email service like SendGrid
    // For now, we'll just open the email client
    openEmailClient();
    toast({
      title: "Email client opened",
      description: "Your default email client has been opened with the takedown request.",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(formData.certificateId ? `/certificate/${formData.certificateId}` : '/')}
            className="text-gray-400 hover:text-gray-300 hover:bg-white hover:bg-opacity-5 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {formData.certificateId ? 'Back to Certificate' : 'Back to Dashboard'}
          </Button>
          
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-white">Report Theft</h1>
              <p className="text-gray-400">
                Generate a professional takedown notice for copyright infringement
              </p>
            </div>
          </div>
          
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
            <p className="text-red-300 text-sm">
              <strong>Certificate ID:</strong> {formData.certificateId || 'None (General Report)'}
            </p>
            <p className="text-red-300 text-sm mt-1">
              This tool generates DMCA-compliant takedown notices for intellectual property theft.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Form */}
          <div>
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Report Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Platform Selection */}
                  <div>
                    <Label className="text-white mb-3 block">Select Platform</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <Button
                            key={platform.name}
                            type="button"
                            variant={formData.platform === platform.name ? "default" : "outline"}
                            onClick={() => handlePlatformSelect(platform.name, platform.email)}
                            className={`justify-start ${
                              formData.platform === platform.name 
                                ? "btn-glass" 
                                : "border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                            }`}
                          >
                            <Icon className={`mr-2 h-4 w-4 ${platform.color}`} />
                            {platform.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certificate ID (Optional) */}
                  <div>
                    <Label htmlFor="certificateId" className="text-white">
                      Certificate ID (Optional)
                    </Label>
                    <Input
                      id="certificateId"
                      type="text"
                      value={formData.certificateId}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificateId: e.target.value }))}
                      className="mt-2 glass-morphism border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter certificate ID if reporting theft of certified work"
                    />
                  </div>

                  {/* Infringing URL */}
                  <div>
                    <Label htmlFor="infringingUrl" className="text-white">
                      Infringing Content URL *
                    </Label>
                    <Input
                      id="infringingUrl"
                      type="url"
                      required
                      value={formData.infringingUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, infringingUrl: e.target.value }))}
                      className="mt-2 glass-morphism border-gray-600 text-white placeholder-gray-400"
                      placeholder="https://example.com/stolen-content"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-white">
                      Description of Infringement *
                    </Label>
                    <Textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 glass-morphism border-gray-600 text-white placeholder-gray-400"
                      placeholder="Describe how your copyrighted work is being used without permission..."
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <Label htmlFor="contactEmail" className="text-white">
                      Platform Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="mt-2 glass-morphism border-gray-600 text-white placeholder-gray-400"
                      placeholder="Auto-filled when platform is selected"
                      readOnly={!!formData.platform}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={reportMutation.isPending}
                    className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
                  >
                    {reportMutation.isPending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <ButtonLoader />
                        <span>Generating Report...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>Generate Takedown Notice</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </GlassCard>
          </div>

          {/* Generated Email */}
          <div>
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Generated Email</h2>
                
                {generatedEmail ? (
                  <div className="space-y-4">
                    {platformEmail && (
                      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">
                          <strong>Send to:</strong> {platformEmail}
                        </p>
                        <p className="text-blue-300 text-sm">
                          <strong>Platform:</strong> {formData.platform}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {generatedEmail}
                      </pre>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={copyEmailTemplate}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Email
                      </Button>
                      
                      <Button
                        onClick={openEmailClient}
                        className="flex-1 btn-glass py-3 rounded-2xl font-semibold text-white"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    </div>
                    
                    {certificateUrl && (
                      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                        <p className="text-green-300 text-sm">
                          <strong>Certificate Verification:</strong>
                        </p>
                        <p className="text-green-300 text-sm font-mono break-all">
                          {certificateUrl}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Send className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-400">
                      Fill out the form to generate a professional takedown notice
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Legal Disclaimer */}
            <div className="mt-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h3 className="text-yellow-300 font-semibold mb-2">Legal Disclaimer</h3>
              <p className="text-yellow-200 text-sm">
                This tool generates template DMCA takedown notices. You are responsible for ensuring 
                the accuracy of your claims. False claims may result in legal consequences. 
                Consider consulting with a legal professional for complex cases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}