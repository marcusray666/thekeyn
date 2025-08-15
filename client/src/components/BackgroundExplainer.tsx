import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Clock, 
  Target, 
  TrendingUp, 
  Palette,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export function BackgroundExplainer() {
  const steps = [
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Track Your Behavior",
      description: "The system watches how long you spend looking at different gradient styles"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Learn Your Preferences", 
      description: "AI analyzes your patterns to understand what backgrounds you prefer"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Adapt to Context",
      description: "Different pages get different suggestions based on their purpose"
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Generate Personalized Backgrounds",
      description: "Creates custom gradients that match your unique taste and usage patterns"
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-gray-800">
          <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] p-2 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          How the Background Engine Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step by step explanation */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] p-2 rounded-lg text-white">
                  {step.icon}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* What it tracks */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">What Gets Tracked</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Time spent on gradients</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Color preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Page context</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Time of day patterns</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Benefits</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Personalized Experience</Badge>
            <Badge variant="secondary">Reduced Eye Strain</Badge>
            <Badge variant="secondary">Better Focus</Badge>
            <Badge variant="secondary">Automatic Adaptation</Badge>
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Privacy:</strong> All data stays on your device and our secure servers. 
            No personal information is shared with third parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}