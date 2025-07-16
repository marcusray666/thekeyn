import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogIn, ArrowLeft, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ButtonLoader } from "@/components/ui/liquid-glass-loader";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: async (data) => {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      
      // Immediately invalidate auth cache and refetch to get updated session
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      
      // Wait longer for browser cookie to be set, then refetch and navigate
      setTimeout(async () => {
        try {
          await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
          
          // Navigate after ensuring auth state is updated
          const pendingUpload = localStorage.getItem('pendingUpload');
          if (pendingUpload) {
            localStorage.removeItem('pendingUpload');
            setLocation('/upload-work');
          } else {
            setLocation('/dashboard');
          }
        } catch (error) {
          console.error("Auth refetch failed:", error);
          // Try navigation anyway, auth will redirect if needed
          setLocation('/dashboard');
        }
      }, 500);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="logo-glass w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your Prooff account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 glass-morphism border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 glass-morphism border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <ButtonLoader />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => setLocation('/register')}
                className="text-purple-400 hover:text-purple-300 p-0 h-auto"
              >
                Create one here
              </Button>
            </p>
          </div>

          {/* Back to Welcome */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Welcome
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}