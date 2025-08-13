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
    <div style={{ 
      minHeight: '100vh', 
      background: '#0F0F0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundImage: 'linear-gradient(135deg, rgba(254, 63, 94, 0.05) 0%, rgba(255, 210, 0, 0.05) 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Back Button */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          color: '#ffffff',
          textDecoration: 'none',
          marginBottom: '24px',
          fontSize: '14px',
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }}>
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>Log In</h1>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '8px'
              }}>
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
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FE3F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(254, 63, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '8px'
              }}>
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
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FE3F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(254, 63, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                background: '#FE3F5E',
                border: 'none',
                borderRadius: '12px',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.6 : 1,
                marginTop: '8px'
              }}
            >
              {loginMutation.isPending ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: '24px'
          }}>
            <span style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Don't have an account?{" "}
              <Link href="/register" style={{
                color: '#FE3F5E',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}