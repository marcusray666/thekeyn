import { Link } from "wouter";
import { X, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionCancelled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 flex items-center justify-center p-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-white/70">
            Your subscription upgrade was cancelled
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-white/70">
              No payment was processed. You can try again at any time or continue using your current plan.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">What you can do:</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                Try upgrading again with a different payment method
              </li>
              <li className="flex items-start gap-2">
                <ArrowLeft className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                Continue using your current plan features
              </li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Link href="/subscription">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              <Link href="/studio">
                Go to Studio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}