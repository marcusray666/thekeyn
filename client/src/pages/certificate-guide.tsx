import { useState } from "react";
import { ArrowLeft, Shield, Copy, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function CertificateGuide() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const useCases = [
    {
      icon: Shield,
      title: "Copyright Protection",
      description: "DMCA takedowns, legal disputes, court evidence",
      examples: [
        "DMCA takedown notices",
        "Legal contract references", 
        "Court evidence documentation",
        "Cease and desist letters"
      ]
    },
    {
      icon: ExternalLink,
      title: "Social Media & Online",
      description: "Prove authenticity on platforms and portfolios",
      examples: [
        "Instagram/TikTok bio verification",
        "YouTube video descriptions",
        "Portfolio website credentials",
        "NFT marketplace authenticity"
      ]
    },
    {
      icon: CheckCircle,
      title: "Business & Commercial",
      description: "Client work, licensing, and brand partnerships",
      examples: [
        "Client delivery documents",
        "Licensing agreement references",
        "Brand partnership verification",
        "Stock photo authenticity"
      ]
    },
    {
      icon: Info,
      title: "Academic & Professional",
      description: "Research, presentations, and grant applications",
      examples: [
        "Research paper citations",
        "Conference presentation credits",
        "Professional portfolio verification",
        "Grant application proof"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] rounded-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Certificate ID Usage Guide</h1>
          </div>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Your Certificate ID is a unique, blockchain-verified proof of ownership for your digital creations. 
            Here's how to use it for maximum protection and credibility.
          </p>
        </div>

        {/* Certificate ID Example */}
        <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-white flex items-center gap-2 text-xl font-semibold mb-2">
              <Shield className="h-5 w-5 text-[#FE3F5E]" />
              Certificate ID Format
            </h3>
            <p className="text-white/60">
              All Loggin Certificate IDs follow this secure format
            </p>
          </div>
          <div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
              <div className="text-center">
                <div className="text-2xl font-mono text-[#FFD200] mb-4">
                  CERT-MDGX1PKF-796E636273939F7F
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-[#FE3F5E] border-[#FE3F5E]/50 bg-[#FE3F5E]/10">Prefix</Badge>
                    <div className="text-white/70">CERT-</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-[#FFD200] border-[#FFD200]/50 bg-[#FFD200]/10">Identifier</Badge>
                    <div className="text-white/70">MDGX1PKF</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-[#00D4AA] border-[#00D4AA]/50 bg-[#00D4AA]/10">Hash</Badge>
                    <div className="text-white/70">796E636273939F7F</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-white flex items-center gap-3 text-xl font-semibold mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] rounded-xl flex items-center justify-center">
                    <useCase.icon className="h-4 w-4 text-white" />
                  </div>
                  {useCase.title}
                </h3>
                <p className="text-white/60">
                  {useCase.description}
                </p>
              </div>
              <div>
                <ul className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/70">
                      <CheckCircle className="h-4 w-4 text-[#00D4AA] flex-shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Verification */}
        <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-white text-xl font-semibold mb-2">Quick Verification</h3>
            <p className="text-white/60">
              Anyone can verify your Certificate ID instantly
            </p>
          </div>
          <div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-white/70">Visit:</span>
                <code className="text-[#FFD200] font-mono flex-1">
                  https://loggin.com/certificate/[YOUR-CERTIFICATE-ID]
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("https://loggin.com/certificate/", "Verification URL")}
                  className="border-[#FFD200]/50 text-[#FFD200] hover:bg-[#FFD200]/10 bg-[#FFD200]/5"
                >
                  {copiedText === "Verification URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="text-center">
                <Separator className="my-4 bg-white/10" />
                <p className="text-white/70 mb-4">Or verify manually:</p>
                <div className="space-y-2 text-sm text-white/50">
                  <p>1. Go to Loggin.com</p>
                  <p>2. Click "Verify Certificate"</p>
                  <p>3. Enter your Certificate ID</p>
                  <p>4. View blockchain verification details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Verified */}
        <div className="mb-12 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">What Your Certificate ID Verifies</h3>
            <p className="text-white/60">
              Each certificate provides comprehensive proof of authenticity
            </p>
          </div>
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">Original File Hash</div>
                    <div className="text-white/50 text-sm">Proves file hasn't been modified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">Blockchain Timestamp</div>
                    <div className="text-white/50 text-sm">Shows exact creation time</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">Creator Identity</div>
                    <div className="text-white/50 text-sm">Confirms who uploaded the work</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">File Metadata</div>
                    <div className="text-white/50 text-sm">Type, size, and technical details</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">Blockchain Anchor</div>
                    <div className="text-white/50 text-sm">Real blockchain verification proof</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00D4AA]" />
                  <div>
                    <div className="text-white font-medium">Legal Proof</div>
                    <div className="text-white/50 text-sm">Court-admissible evidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                DO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>✅ Keep Certificate ID secure until needed</li>
                <li>✅ Include in all commercial licensing</li>
                <li>✅ Save Certificate ID records for each work</li>
                <li>✅ Use when reporting theft or unauthorized use</li>
                <li>✅ Reference in legal documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                DON'T
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>❌ Share Certificate ID publicly unless necessary</li>
                <li>❌ Use expired certificates for legal claims</li>
                <li>❌ Rely solely on Certificate ID without originals</li>
                <li>❌ Forget to document infringement evidence</li>
                <li>❌ Ignore blockchain verification status</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Emergency: Someone is Using Your Work Without Permission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Immediate Steps:</h4>
                  <ol className="space-y-1 text-gray-300 text-sm">
                    <li>1. Document the infringement (screenshots, URLs)</li>
                    <li>2. Reference your Certificate ID as proof</li>
                    <li>3. File DMCA takedown including Certificate ID</li>
                    <li>4. Contact Loggin support for legal assistance</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Contact Information:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">
                      <strong>Email:</strong> support@loggin.com
                    </div>
                    <div className="text-gray-300">
                      <strong>Subject:</strong> "Copyright Infringement - [Certificate ID]"
                    </div>
                    <div className="text-gray-300">
                      <strong>Response:</strong> Within 24 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => setLocation("/studio")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
          >
            <Shield className="h-5 w-5 mr-2" />
            Protect Your Work Now
          </Button>
          <p className="text-gray-400 mt-4">
            Questions? Contact support@loggin.com with your Certificate ID
          </p>
        </div>
      </div>
    </div>
  );
}