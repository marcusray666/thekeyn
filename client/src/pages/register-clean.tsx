import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

export default function RegisterClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
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

  const isDark = theme === 'dark';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0F0F0F' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Back Button */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          color: isDark ? '#9CA3AF' : '#6B7280',
          textDecoration: 'none',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Register Card */}
        <div style={{
          background: isDark ? '#151518' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#111827',
            textAlign: 'center',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>Sign Up</h1>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#ffffff' : '#111827',
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
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: isDark ? '#ffffff' : '#111827',
                  background: isDark ? '#1F1F23' : '#F9FAFB',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FE3F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(254, 63, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#ffffff' : '#111827',
                marginBottom: '8px'
              }}>
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
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: isDark ? '#ffffff' : '#111827',
                  background: isDark ? '#1F1F23' : '#F9FAFB',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FE3F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(254, 63, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#ffffff' : '#111827',
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
                placeholder="Create a password"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  color: isDark ? '#ffffff' : '#111827',
                  background: isDark ? '#1F1F23' : '#F9FAFB',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FE3F5E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(254, 63, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                background: '#FE3F5E',
                border: 'none',
                borderRadius: '12px',
                cursor: registerMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: registerMutation.isPending ? 0.6 : 1,
                marginTop: '8px'
              }}
            >
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '16px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
            marginTop: '24px'
          }}>
            <span style={{
              fontSize: '14px',
              color: isDark ? '#9CA3AF' : '#6B7280'
            }}>
              Already have an account?{" "}
              <Link href="/login" style={{
                color: '#FE3F5E',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}