import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, ArrowLeft, User, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ButtonLoader } from "@/components/ui/liquid-glass-loader";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      return await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      toast({
        title: "Account created!",
        description: "Welcome to Loggin. Your account has been created successfully.",
      });
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Navigate to dashboard
      setLocation('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-4">Loggin'</h1>
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join Loggin' to protect your creative work</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 glass-input"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 glass-input"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 glass-input"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full relative overflow-hidden"
            >
              {registerMutation.isPending ? (
                <ButtonLoader />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => setLocation('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign in
              </button>
            </p>
            
            <button
              onClick={() => setLocation('/')}
              className="flex items-center justify-center w-full text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Welcome
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}