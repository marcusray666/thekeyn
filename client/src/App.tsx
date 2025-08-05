import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/ui/navigation";
import { ThemeProvider } from "@/components/theme-provider";

import Login from "@/pages/login";
import Register from "@/pages/register";
import UploadPage from "@/pages/upload";
import AuthenticatedUpload from "@/pages/authenticated-upload";
import Home from "@/pages/home";

import MyCertificates from "@/pages/my-certificates";
import CertificateDetail from "@/pages/certificate-detail";
import ReportTheft from "@/pages/report-theft";
import Analytics from "@/pages/analytics";
import BulkOperations from "@/pages/bulk-operations";
import Settings from "@/pages/settings";
import Security from "@/pages/security";
import Profile from "@/pages/profile";
import UserProfile from "@/pages/user-profile";
import Portfolio from "@/pages/portfolio";
import CertificateGuide from "@/pages/certificate-guide";

import NFTMinting from "@/pages/nft-minting";
import NFTStudio from "@/pages/nft-studio";
import SimplifiedNFT from "@/pages/simplified-nft";

import Subscription from "@/pages/subscription";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancelled from "@/pages/subscription-cancelled";
import BlockchainVerification from "@/pages/blockchain-verification";
import Social from "@/pages/social";
import Messages from "@/pages/messages";
import Followers from "@/pages/followers";

import Studio from "@/pages/studio";
import AdminDashboard from "@/pages/admin-dashboard";

import EnhancedDashboard from "@/pages/enhanced-dashboard";
import Welcome from "@/pages/welcome";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/welcome" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/upload" component={UploadPage} />
      
      {/* Home route - dynamic based on auth status */}
      <Route path="/" component={UserProfile} />
      
      {/* Protected routes */}
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={EnhancedDashboard} />
      <Route path="/studio" component={Studio} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/certificates" component={MyCertificates} />
      <Route path="/upload-work" component={AuthenticatedUpload} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/bulk-operations" component={BulkOperations} />

      <Route path="/nft-minting" component={NFTMinting} />
      <Route path="/nft-studio" component={NFTStudio} />
      <Route path="/nft-simple" component={SimplifiedNFT} />
      <Route path="/blockchain-verification" component={BlockchainVerification} />
      <Route path="/social" component={Social} />
      <Route path="/messages" component={Messages} />
      <Route path="/followers" component={Followers} />
      <Route path="/settings" component={Settings} />
      <Route path="/security" component={Security} />
      <Route path="/certificate-guide" component={CertificateGuide} />
      <Route path="/report-theft" component={ReportTheft} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/portfolio/:username" component={Portfolio} />
      <Route path="/portfolio" component={Portfolio} />
      
      {/* Public certificate routes */}
      <Route path="/certificate/:id" component={CertificateDetail} />
      <Route path="/report-theft/:id" component={ReportTheft} />
      
      {/* Subscription routes - accessible to all users */}
      <Route path="/subscription" component={Subscription} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancelled" component={SubscriptionCancelled} />
      
      {/* Legacy profile showcase routes - redirect to main profile */}
      <Route path="/showcase/:username" component={Profile} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div 
            className="min-h-screen text-foreground" 
            style={{ 
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
              color: 'white',
              minHeight: '100vh'
            }}
          >
            {/* Skip Links for Screen Readers */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Navigation />
            <main id="main-content">
              <Router />
            </main>

          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
