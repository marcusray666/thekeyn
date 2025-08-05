import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Info, MessageCircle, CheckCircle } from "lucide-react";

export default function WelcomeClean() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-4 mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Loggin'</h1>
            <p className="text-lg text-muted-foreground">
              Protect your creativity. Build your community.
            </p>
          </div>
          
          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
            <div>
              <Shield className="h-6 w-6 mx-auto mb-1" />
              <p>Blockchain Protection</p>
            </div>
            <div>
              <MessageCircle className="h-6 w-6 mx-auto mb-1" />
              <p>Creator Community</p>
            </div>
            <div>
              <CheckCircle className="h-6 w-6 mx-auto mb-1" />
              <p>Instant Verification</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <Link href="/register" className="block">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              Sign Up
            </Button>
          </Link>
          
          <Link href="/login" className="block">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-border text-foreground hover:bg-muted rounded-lg"
            >
              Log In
            </Button>
          </Link>
        </div>

        {/* How it Works Link */}
        <div className="pt-4">
          <Link href="/how-it-works">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4 mr-2" />
              How it Works
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}