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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white">Certificate ID Usage Guide</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your Certificate ID is a unique, blockchain-verified proof of ownership for your digital creations. 
            Here's how to use it for maximum protection and credibility.
          </p>
        </div>

        {/* Certificate ID Example */}
        <Card className="mb-12 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Certificate ID Format
            </CardTitle>
            <CardDescription className="text-gray-300">
              All Loggin Certificate IDs follow this secure format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-mono text-emerald-400 mb-4">
                  CERT-MDGX1PKF-796E636273939F7F
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-blue-400 border-blue-400">Prefix</Badge>
                    <div className="text-gray-300">CERT-</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-purple-400 border-purple-400">Identifier</Badge>
                    <div className="text-gray-300">MDGX1PKF</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 text-emerald-400 border-emerald-400">Hash</Badge>
                    <div className="text-gray-300">796E636273939F7F</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <useCase.icon className="h-6 w-6 text-emerald-400" />
                  {useCase.title}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Verification */}
        <Card className="mb-12 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Quick Verification</CardTitle>
            <CardDescription className="text-gray-300">
              Anyone can verify your Certificate ID instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Visit:</span>
                <code className="text-emerald-400 font-mono flex-1">
                  https://loggin.com/certificate/[YOUR-CERTIFICATE-ID]
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("https://loggin.com/certificate/", "Verification URL")}
                  className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black"
                >
                  {copiedText === "Verification URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="text-center">
                <Separator className="my-4 bg-gray-700" />
                <p className="text-gray-300 mb-4">Or verify manually:</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>1. Go to Loggin.com</p>
                  <p>2. Click "Verify Certificate"</p>
                  <p>3. Enter your Certificate ID</p>
                  <p>4. View blockchain verification details</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Verified */}
        <Card className="mb-12 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">What Your Certificate ID Verifies</CardTitle>
            <CardDescription className="text-gray-300">
              Each certificate provides comprehensive proof of authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">Original File Hash</div>
                    <div className="text-gray-400 text-sm">Proves file hasn't been modified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">Blockchain Timestamp</div>
                    <div className="text-gray-400 text-sm">Shows exact creation time</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">Creator Identity</div>
                    <div className="text-gray-400 text-sm">Confirms who uploaded the work</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">File Metadata</div>
                    <div className="text-gray-400 text-sm">Type, size, and technical details</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">Blockchain Anchor</div>
                    <div className="text-gray-400 text-sm">Real blockchain verification proof</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-white font-medium">Legal Proof</div>
                    <div className="text-gray-400 text-sm">Court-admissible evidence</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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