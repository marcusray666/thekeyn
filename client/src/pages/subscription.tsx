import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Check, Crown, Sparkles, Users, Zap, Upload, Download, Palette, Cloud, Code } from "lucide-react";

interface SubscriptionData {
  tier: string;
  uploadLimit: number;
  uploadsUsed: number;
  remainingUploads: number;
  canUpload: boolean;
  hasDownloadableCertificates: boolean;
  hasCustomBranding: boolean;
  hasIPFSStorage: boolean;
  hasAPIAccess: boolean;
  teamSize: number;
  expiresAt?: string;
  isActive: boolean;
}

const tierInfo = {
  free: {
    name: "Free",
    price: 0,
    description: "Perfect for trying out Loggin'",
    icon: Sparkles,
    features: [
      "3 uploads per month",
      "Basic certificate generation",
      "Community support",
      "Web app access"
    ]
  },
  starter: {
    name: "Starter",
    price: 7.99,
    description: "Great for individual creators",
    icon: Zap,
    features: [
      "10 uploads per month",
      "Downloadable PDF certificates",
      "Priority support",
      "Mobile app access",
      "Basic analytics"
    ]
  },
  pro: {
    name: "Pro",
    price: 19.99,
    description: "Perfect for professional creators",
    icon: Crown,
    features: [
      "Unlimited uploads",
      "Custom branding on certificates",
      "IPFS storage integration",
      "API access",
      "Advanced analytics",
      "NFT minting capabilities"
    ]
  },
  agency: {
    name: "Agency",
    price: 49.99,
    description: "Built for teams and agencies",
    icon: Users,
    features: [
      "Everything in Pro",
      "Multi-seat access (up to 10 users)",
      "Team collaboration tools",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations"
    ]
  }
};

export default function Subscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscriptionData, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (tier: string) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      console.log("Creating checkout session for tier:", tier);
      const response = await apiRequest("POST", "/api/subscription/create-checkout", { tier });
      console.log("Checkout response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Checkout success, redirecting to:", data.url);
      setLoading(null); // Clear loading state before redirect
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Checkout error:", error);
      setLoading(null); // Clear loading state on error
      if (error.message.includes("Authentication required") || error.message.includes("401")) {
        toast({
          title: "Login Required",
          description: "Please log in to subscribe to a plan.",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create checkout session",
          variant: "destructive",
        });
      }
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/cancel");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will expire at the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/reactivate");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate subscription",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (tier: string) => {
    console.log("Starting upgrade process for tier:", tier);
    setLoading(tier);
    
    // Add timeout fallback to clear loading state if something goes wrong
    const timeoutId = setTimeout(() => {
      console.warn("Checkout process timed out, clearing loading state");
      setLoading(null);
      toast({
        title: "Request Timeout",
        description: "The request took too long. Please try again.",
        variant: "destructive",
      });
    }, 30000); // 30 second timeout
    
    createCheckoutMutation.mutate(tier, {
      onSettled: () => {
        clearTimeout(timeoutId);
      }
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading only if authenticated user is loading their data
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-white/70">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only if authenticated and fetching subscription data
  if (isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-white/70">Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTier = subscriptionData?.tier || 'free';
  const currentTierInfo = tierInfo[currentTier as keyof typeof tierInfo];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 pt-24 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {isAuthenticated ? "Subscription Management" : "Choose Your Plan"}
          </h1>
          <p className="text-xl text-white/70">
            {isAuthenticated 
              ? "Manage your subscription and view usage statistics" 
              : "Choose the perfect plan for your creative protection needs"
            }
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/login")}
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button 
                onClick={() => setLocation("/register")}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Current Plan & Usage - Only for authenticated users */}
        {isAuthenticated && subscriptionData && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current Plan */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <currentTierInfo.icon className="w-5 h-5" />
                  Current Plan: {currentTierInfo.name}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {currentTierInfo.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Monthly Price:</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-100">
                    ${currentTierInfo.price}/month
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge 
                      variant={subscriptionData.isActive ? 'default' : 'destructive'}
                      className={subscriptionData.isActive ? 'bg-green-500/20 text-green-100' : ''}
                    >
                      {subscriptionData.isActive ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                  
                  {subscriptionData.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span>Expires:</span>
                      <span className="text-sm text-white/70">
                        {new Date(subscriptionData.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Usage Statistics
                </CardTitle>
                <CardDescription className="text-white/70">
                  Current month usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Uploads</span>
                    <span className="text-sm">
                      {subscriptionData.uploadsUsed} / {subscriptionData.uploadLimit === -1 ? '∞' : subscriptionData.uploadLimit}
                    </span>
                  </div>
                  <Progress 
                    value={subscriptionData.uploadLimit === -1 ? 0 : 
                      (subscriptionData.uploadsUsed / subscriptionData.uploadLimit) * 100
                    } 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Can Upload</span>
                    <Badge 
                      variant={subscriptionData.canUpload ? 'default' : 'destructive'}
                      className={subscriptionData.canUpload ? 'bg-green-500/20 text-green-100' : ''}
                    >
                      {subscriptionData.canUpload ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Remaining Uploads</span>
                    <span className="text-sm">
                      {subscriptionData.remainingUploads === Infinity ? '∞' : subscriptionData.remainingUploads}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(tierInfo).map(([tier, info]) => {
            const isCurrentPlan = tier === currentTier;
            const Icon = info.icon;

            return (
              <Card 
                key={tier}
                className={`bg-white/10 backdrop-blur-md border-white/20 text-white relative ${
                  tier === 'pro' ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {tier === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <CardTitle className="text-2xl">{info.name}</CardTitle>
                  <CardDescription className="text-white/70">
                    {info.description}
                  </CardDescription>
                  <div className="text-3xl font-bold">
                    {info.price === 0 ? 'Free' : `$${info.price}`}
                    {info.price > 0 && <span className="text-sm font-normal text-white/70">/month</span>}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {info.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full bg-green-500/20 text-green-300">
                        Current Plan
                      </Button>
                    ) : tier === 'free' ? (
                      <Button disabled className="w-full" variant="outline">
                        Free Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(tier)}
                        disabled={loading === tier}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {loading === tier ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          `Upgrade to ${info.name}`
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription className="text-white/70">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-center py-2 px-4">Free</th>
                    <th className="text-center py-2 px-4">Starter</th>
                    <th className="text-center py-2 px-4">Pro</th>
                    <th className="text-center py-2 px-4">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Monthly Uploads
                    </td>
                    <td className="text-center py-2 px-4">3</td>
                    <td className="text-center py-2 px-4">10</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Downloadable Certificates
                    </td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">✅</td>
                    <td className="text-center py-2 px-4">✅</td>
                    <td className="text-center py-2 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Custom Branding
                    </td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">✅</td>
                    <td className="text-center py-2 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      IPFS Storage
                    </td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">✅</td>
                    <td className="text-center py-2 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      API Access
                    </td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">❌</td>
                    <td className="text-center py-2 px-4">✅</td>
                    <td className="text-center py-2 px-4">✅</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Size
                    </td>
                    <td className="text-center py-2 px-4">1</td>
                    <td className="text-center py-2 px-4">1</td>
                    <td className="text-center py-2 px-4">1</td>
                    <td className="text-center py-2 px-4">10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}