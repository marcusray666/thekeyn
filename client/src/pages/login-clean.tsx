import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import "@/styles/login.css";

export default function LoginClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
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

  const isDark = theme === 'dark';

  return (
    <div className={`login-page ${isDark ? 'dark' : ''}`}>
      <div className="login-container">
        {/* Back Button */}
        <Link href="/" className={`login-back-button ${isDark ? 'dark' : ''}`}>
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Login Card */}
        <div className={`login-card ${isDark ? 'dark' : ''}`}>
          <div className="login-header">
            <h1 className={`login-title ${isDark ? 'dark' : ''}`}>Log In</h1>
          </div>
          
          <div className="login-content">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="username" className={`login-label ${isDark ? 'dark' : ''}`}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={`login-input ${isDark ? 'dark' : ''}`}
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="login-field">
                <label htmlFor="password" className={`login-label ${isDark ? 'dark' : ''}`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`login-input ${isDark ? 'dark' : ''}`}
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className={`login-footer ${isDark ? 'dark' : ''}`}>
              <span className={`login-footer-text ${isDark ? 'dark' : ''}`}>
                Don't have an account?{" "}
                <Link href="/register" className="login-footer-link">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}