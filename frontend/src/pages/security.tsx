import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Key,
  Globe,
  Clock,
  UserCheck,
  FileText,
  Database,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface SecurityFeature {
  name: string;
  description: string;
  status: 'active' | 'warning' | 'info';
  icon: any;
  details: string[];
}

export default function Security() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const securityFeatures: SecurityFeature[] = [
    {
      name: "Password Security",
      description: "Strong password hashing with bcrypt (12 rounds)",
      status: 'active',
      icon: Lock,
      details: [
        "bcrypt hashing with 12 salt rounds",
        "Password verification before changes",
        "Case-insensitive username handling",
        "No plain text password storage"
      ]
    },
    {
      name: "Session Management",
      description: "Secure session handling with proper cookie settings",
      status: 'active',
      icon: Clock,
      details: [
        "HttpOnly cookies prevent XSS attacks",
        "Secure cookies in production (HTTPS)",
        "SameSite=strict for CSRF protection",
        "7-day session expiration",
        "Custom session name (not default)"
      ]
    },
    {
      name: "Input Validation",
      description: "Comprehensive input sanitization using Zod schemas",
      status: 'active',
      icon: CheckCircle,
      details: [
        "Zod schema validation for all inputs",
        "File type whitelist for uploads",
        "Malicious character filtering",
        "JSON parsing with error handling",
        "SQL injection prevention via ORM"
      ]
    },
    {
      name: "Rate Limiting",
      description: "Multiple rate limits to prevent abuse",
      status: 'active',
      icon: Zap,
      details: [
        "General API: 100 requests per 15 minutes",
        "Authentication: 5 attempts per 15 minutes",
        "File uploads: 20 uploads per hour",
        "IP-based tracking",
        "Automatic blocking of excessive requests"
      ]
    },
    {
      name: "Security Headers",
      description: "Helmet.js security headers for protection",
      status: 'active',
      icon: Shield,
      details: [
        "Content Security Policy (CSP)",
        "X-Frame-Options protection",
        "X-Content-Type-Options: nosniff",
        "Referrer-Policy controls",
        "HTTPS upgrade enforcement"
      ]
    },
    {
      name: "File Upload Security",
      description: "Secure file handling and validation",
      status: 'active',
      icon: FileText,
      details: [
        "MIME type validation",
        "File size limits (500MB max)",
        "Malicious file filtering",
        "Secure file storage outside web root",
        "Content-Type header verification"
      ]
    },
    {
      name: "Authentication & Authorization",
      description: "Robust user authentication system",
      status: 'active',
      icon: UserCheck,
      details: [
        "Session-based authentication",
        "Role-based access control",
        "Protected route middleware",
        "User ownership verification",
        "Automatic session cleanup"
      ]
    },
    {
      name: "Privacy Controls",
      description: "User privacy settings enforcement",
      status: 'active',
      icon: Globe,
      details: [
        "Profile visibility controls",
        "Direct message permissions",
        "Data sharing preferences",
        "Statistics visibility options",
        "Real-time privacy enforcement"
      ]
    },
    {
      name: "Database Security",
      description: "Secure data storage and access",
      status: 'active',
      icon: Database,
      details: [
        "PostgreSQL with parameterized queries",
        "Drizzle ORM prevents SQL injection",
        "Encrypted sensitive data",
        "Database connection pooling",
        "Regular security updates"
      ]
    },
    {
      name: "Blockchain Verification",
      description: "Cryptographic proof of work authenticity",
      status: 'info',
      icon: Key,
      details: [
        "SHA-256 file hashing",
        "Ethereum mainnet anchoring",
        "OpenTimestamps integration",
        "Immutable blockchain records",
        "Verifiable proof generation"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Shield;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to view security information.</p>
          <Button 
            onClick={() => setLocation('/login')}
            className="btn-glass"
          >
            Go to Login
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Platform Security</h1>
            <p className="text-gray-300 text-lg">
              Your creative works are protected by enterprise-grade security measures
            </p>
          </div>

          {/* Security Overview */}
          <GlassCard className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {securityFeatures.filter(f => f.status === 'active').length}
                </div>
                <p className="text-gray-300">Active Protections</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">256-bit</div>
                <p className="text-gray-300">Encryption Standard</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                <p className="text-gray-300">Uptime Security</p>
              </div>
            </div>
          </GlassCard>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => {
              const StatusIcon = getStatusIcon(feature.status);
              const IconComponent = feature.icon;
              
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                          <IconComponent className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                          <p className="text-gray-300 text-sm">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`p-1 rounded-full border ${getStatusColor(feature.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Security Tips */}
          <GlassCard className="p-6 mt-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Info className="h-5 w-5 text-blue-400 mr-2" />
              Security Best Practices
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-200">For Your Account:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Enable two-factor authentication when available</li>
                  <li>• Review your privacy settings regularly</li>
                  <li>• Log out from shared computers</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-200">For Your Works:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Upload high-quality originals for best protection</li>
                  <li>• Add detailed descriptions to your works</li>
                  <li>• Keep backup copies of important files</li>
                  <li>• Use blockchain verification for critical works</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          <div className="text-center mt-8">
            <Button 
              onClick={() => setLocation('/settings')}
              className="btn-glass"
            >
              Manage Privacy Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}