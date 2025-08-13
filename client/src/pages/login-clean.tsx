import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import "@/styles/login.css";

export default function LoginClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Check if user was trying to upload before login
      const pendingUpload = localStorage.getItem('pendingUpload');
      if (pendingUpload) {
        setLocation('/authenticated-upload');
      } else {
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 light-theme">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 mb-6 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Log In
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full h-12 px-4 text-gray-800 bg-white/80 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#FE3F5E] focus:ring-2 focus:ring-[#FE3F5E]/20 backdrop-blur-md"
              />
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full h-12 px-4 text-gray-800 bg-white/80 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#FE3F5E] focus:ring-2 focus:ring-[#FE3F5E]/20 backdrop-blur-md"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full h-12 text-white font-semibold bg-[#FE3F5E] hover:bg-[#FE3F5E]/90 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-6"
            >
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-gray-200/50">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="text-[#FE3F5E] hover:text-[#FE3F5E]/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}