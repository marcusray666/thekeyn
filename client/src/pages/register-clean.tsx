import { useState } from "react";
import { Link, useLocation } from "wouter";
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

        {/* Register Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Sign Up
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
                placeholder="Choose a username"
                className="w-full h-12 px-4 text-gray-800 bg-white/80 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#FE3F5E] focus:ring-2 focus:ring-[#FE3F5E]/20 backdrop-blur-md"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
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
                placeholder="Create a password"
                className="w-full h-12 px-4 text-gray-800 bg-white/80 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#FE3F5E] focus:ring-2 focus:ring-[#FE3F5E]/20 backdrop-blur-md"
              />
            </div>

            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full h-12 text-white font-semibold bg-[#FE3F5E] hover:bg-[#FE3F5E]/90 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-6"
            >
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-gray-200/50">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-[#FE3F5E] hover:text-[#FE3F5E]/80 font-medium transition-colors"
              >
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}