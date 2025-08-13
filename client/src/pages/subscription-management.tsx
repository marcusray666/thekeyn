import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Crown, 
  Zap, 
  Shield, 
  Sparkles, 
  Check, 
  Star,
  Building2,
  Coins,
  TrendingUp,
  Clock,
  Users,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  icon: any;
  gradient: string;
  nftBlockchains: string[];
  uploadLimit: string;
  supportLevel: string;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Creator',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with digital protection',
    features: [
      'Upload up to 10 works per month',
      'Basic certificate generation',
      'Polygon NFT minting',
      'Basic DMCA protection',
      'Community support'
    ],
    limitations: [
      'Limited to Polygon blockchain',
      'Standard processing time',
      'Community support only'
    ],
    icon: Shield,
    gradient: 'from-gray-600 to-gray-700',
    nftBlockchains: ['Polygon'],
    uploadLimit: '10 works/month',
    supportLevel: 'Community'
  },
  {
    id: 'premium',
    name: 'Premium Creator',
    price: '$19',
    period: 'per month',
    description: 'Advanced features for serious creators',
    features: [
      'Unlimited work uploads',
      'All blockchain networks (Ethereum, Polygon, Arbitrum, Base)',
      'Priority NFT minting',
      'Advanced certificate customization',
      'Government copyright integration',
      'Professional DMCA services',
      'Priority support',
      'Advanced analytics dashboard',
      'Bulk operations',
      'Custom royalty settings'
    ],
    popular: true,
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-600',
    nftBlockchains: ['Ethereum', 'Polygon', 'Arbitrum', 'Base'],
    uploadLimit: 'Unlimited',
    supportLevel: 'Priority (24h response)'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    description: 'Complete protection suite for organizations',
    features: [
      'Everything in Premium',
      'Multi-user team accounts',
      'Custom branding',
      'API access',
      'Advanced compliance tools',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solutions',
      'Enterprise-grade security',
      'SLA guarantees'
    ],
    icon: Building2,
    gradient: 'from-purple-600 to-blue-600',
    nftBlockchains: ['All networks + Custom'],
    uploadLimit: 'Unlimited + Team accounts',
    supportLevel: 'Dedicated manager (1h response)'
  }
];

export default function SubscriptionManagement() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentTier = user?.subscriptionTier || 'free';

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      return await apiRequest(`/api/subscription/upgrade`, {
        method: 'POST',
        body: JSON.stringify({ tierId })
      });
    },
    onSuccess: (data, tierId) => {
      toast({
        title: "Subscription Updated",
        description: `Successfully upgraded to ${SUBSCRIPTION_TIERS.find(t => t.id === tierId)?.name}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsUpgrading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
      setIsUpgrading(false);
    }
  });

  const handleUpgrade = (tierId: string) => {
    if (tierId === 'free') return;
    setIsUpgrading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      upgradeMutation.mutate(tierId);
    }, 2000);
  };

  const currentTierData = SUBSCRIPTION_TIERS.find(tier => tier.id === currentTier);

  return (
    <div className="min-h-screen pt-20 p-6 light-theme">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 mr-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Subscription Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Choose the perfect plan for your creative protection needs
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentTierData && (
          <div className="mb-12">
            <GlassCard className="border-2 border-yellow-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTierData.gradient}`}>
                      <currentTierData.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Current Plan: {currentTierData.name}
                      </h3>
                      <p className="text-gray-400">
                        {currentTierData.price} {currentTierData.period}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-900 bg-opacity-50 text-green-300 border-green-600">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Upload Limit</p>
                    <p className="text-white font-semibold">{currentTierData.uploadLimit}</p>
                  </div>
                  <div className="text-center">
                    <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">NFT Networks</p>
                    <p className="text-white font-semibold">{currentTierData.nftBlockchains.length} networks</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Support Level</p>
                    <p className="text-white font-semibold">{currentTierData.supportLevel}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrentTier = tier.id === currentTier;
            const canUpgrade = tier.id !== 'free' && tier.id !== currentTier;
            
            return (
              <GlassCard 
                key={tier.id}
                className={`relative ${tier.popular ? 'border-2 border-yellow-500' : ''} ${
                  isCurrentTier ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold px-4 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white font-semibold px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tier.gradient} mb-4`}>
                      <tier.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-400 ml-1">/{tier.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{tier.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {tier.limitations && tier.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start space-x-2 opacity-60">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={!canUpgrade || isUpgrading}
                    className={`w-full py-3 font-semibold ${
                      isCurrentTier 
                        ? 'bg-green-600 text-white cursor-default' 
                        : tier.id === 'free'
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : `btn-glass bg-gradient-to-r ${tier.gradient} text-white hover:opacity-90`
                    }`}
                  >
                    {isCurrentTier ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Current Plan
                      </>
                    ) : tier.id === 'free' ? (
                      'Downgrade Not Available'
                    ) : isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Upgrade to {tier.name}
                      </>
                    )}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mb-8">
          <GlassCard>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Feature Comparison
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Free</th>
                      <th className="text-center py-3 px-4">Premium</th>
                      <th className="text-center py-3 px-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Monthly Uploads</td>
                      <td className="text-center py-3 px-4">10</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">NFT Blockchain Networks</td>
                      <td className="text-center py-3 px-4">1 (Polygon)</td>
                      <td className="text-center py-3 px-4">4 Networks</td>
                      <td className="text-center py-3 px-4">All + Custom</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Government Copyright</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Priority Support</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅ (24h)</td>
                      <td className="text-center py-3 px-4">✅ (1h)</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Team Accounts</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">API Access</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Billing Information */}
        <div className="text-center text-gray-400">
          <p className="mb-2">
            All plans include our core protection features, blockchain certificates, and DMCA tools.
          </p>
          <p className="text-sm">
            Cancel anytime • 30-day money-back guarantee • Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
}