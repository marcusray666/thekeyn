import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function RegisterClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Welcome to Loggin'!",
      });
      
      // Check if user was trying to upload before registration
      const pendingUpload = localStorage.getItem('pendingUpload');
      if (pendingUpload) {
        setLocation('/authenticated-upload');
      } else {
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Register Card */}
        <Card className="bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/10 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE3F5E] focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE3F5E] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FE3F5E] focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FE3F5E] hover:bg-[#FE3F5E]/90 text-white font-semibold rounded-xl transition-all duration-200 mt-6"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-white/10">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#FE3F5E] hover:text-[#FE3F5E]/80 font-medium hover:underline">
                  Log in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}