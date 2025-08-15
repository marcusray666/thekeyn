import React, { useState, useEffect } from 'react';
import { BackgroundEngine } from '@/components/BackgroundEngine';
import { BackgroundPreferencesPanel } from '@/components/BackgroundPreferencesPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Eye, 
  Settings,
  Brain,
  Target,
  Zap
} from 'lucide-react';

export default function BackgroundDemo() {
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentGradient, setCurrentGradient] = useState('Default Gradient');

  const simulateInteraction = (type: string) => {
    setInteractionCount(prev => prev + 1);
    console.log(`Simulated interaction: ${type}`);
  };

  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Learning Algorithm",
      description: "The engine learns from your behavior patterns and time spent on different gradients",
      demo: () => simulateInteraction('learning')
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Contextual Adaptation", 
      description: "Different pages get different gradient suggestions based on their purpose",
      demo: () => simulateInteraction('context')
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Trend Analysis",
      description: "Popular gradients from the community influence your recommendations",
      demo: () => simulateInteraction('trend')
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Time-Based Preferences",
      description: "Morning vs evening preferences are tracked and applied automatically",
      demo: () => simulateInteraction('time')
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Visual Comfort",
      description: "Intensity and contrast adjust based on your usage patterns",
      demo: () => simulateInteraction('comfort')
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time Adaptation",
      description: "Background changes dynamically as you interact with the platform",
      demo: () => simulateInteraction('realtime')
    }
  ];

  return (
    <BackgroundEngine pageContext="/background-demo" className="min-h-screen light-theme">
      {/* Demo Header */}
      <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-start">
        <Card className="bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Background Engine Demo</h1>
                <p className="text-sm text-gray-600">Personalized gradient learning system</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackgroundPreferencesPanel 
          trigger={
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/90 backdrop-blur-xl border-gray-200/50 hover:bg-white shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
          }
        />
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Row */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#FE3F5E] mb-1">{interactionCount}</div>
                <div className="text-sm text-gray-600">Interactions Tracked</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#FFD200] mb-1">3</div>
                <div className="text-sm text-gray-600">AI Suggestions</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500 mb-1">7</div>
                <div className="text-sm text-gray-600">Preference Patterns</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">92%</div>
                <div className="text-sm text-gray-600">Accuracy Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-gray-800">
                    <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] p-2 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={feature.demo}
                    className="w-full"
                  >
                    Test Feature
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <Brain className="h-6 w-6 text-[#FE3F5E]" />
                How the AI Engine Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Data Collection</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Time spent on each gradient style</li>
                    <li>• Click patterns and interactions</li>
                    <li>• Page context and usage timing</li>
                    <li>• Device type and screen size</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">AI Processing</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pattern recognition algorithms</li>
                    <li>• Preference clustering analysis</li>
                    <li>• Contextual recommendation engine</li>
                    <li>• Real-time adaptation system</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4">
                <Badge variant="secondary">Machine Learning</Badge>
                <Badge variant="secondary">Real-time Processing</Badge>
                <Badge variant="secondary">User Privacy</Badge>
                <Badge variant="secondary">Contextual AI</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Current gradient: <strong>{currentGradient}</strong></p>
            <p className="text-sm text-gray-500">
              The background you see now is being analyzed and learned from by the AI engine.
              Your preferences are being tracked to improve future recommendations.
            </p>
          </div>
        </div>
      </div>
    </BackgroundEngine>
  );
}