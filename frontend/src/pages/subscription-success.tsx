import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Check, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionSuccess() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    setSessionId(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 flex items-center justify-center p-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-white/70">
            Welcome to your new subscription plan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-semibold">Subscription Activated</span>
            </div>
            
            <p className="text-white/70">
              Your subscription has been successfully activated. You now have access to all premium features.
            </p>
            
            {sessionId && (
              <div className="text-xs text-white/50 break-all">
                Session: {sessionId}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">What's next?</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                Start uploading your creative works with your new limits
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                Download professional PDF certificates
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                Access advanced features in your Studio
              </li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Link href="/studio">
                Go to Studio
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              <Link href="/subscription">
                View Subscription
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}