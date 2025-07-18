import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenLoader } from "@/components/ui/liquid-glass-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UploadPage from "@/pages/upload";
import AuthenticatedUpload from "@/pages/authenticated-upload";
import Home from "@/pages/home";
import Certificates from "@/pages/certificates";
import MyCertificates from "@/pages/my-certificates";
import CertificateDetail from "@/pages/certificate-detail";
import ReportTheft from "@/pages/report-theft";
import Analytics from "@/pages/analytics";
import BulkOperations from "@/pages/bulk-operations";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import CopyrightRegistration from "@/pages/copyright-registration";
import NFTMinting from "@/pages/nft-minting";
import NFTStudio from "@/pages/nft-studio";
import SimplifiedNFT from "@/pages/simplified-nft";
import SubscriptionManagement from "@/pages/subscription-management";
import Social from "@/pages/social";
import ProfileShowcase from "@/pages/profile-showcase";
import NotFound from "@/pages/not-found";

function AuthenticatedHome() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullScreenLoader text="Loading your portfolio..." />;
  }
  
  if (!isAuthenticated) {
    return <Welcome />;
  }
  
  // For authenticated users, show the profile showcase
  return <ProfileShowcase />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <FullScreenLoader text="Loading your creative space..." />
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        {isAuthenticated ? <AuthenticatedHome /> : <Welcome />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/upload" component={UploadPage} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/home" component={Home} />
          <Route path="/certificates" component={MyCertificates} />
          <Route path="/upload-work" component={AuthenticatedUpload} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/bulk-operations" component={BulkOperations} />
          <Route path="/copyright-registration" component={CopyrightRegistration} />
          <Route path="/nft-minting" component={NFTMinting} />
          <Route path="/nft-studio" component={NFTStudio} />
          <Route path="/nft-simple" component={SimplifiedNFT} />
          <Route path="/subscription" component={SubscriptionManagement} />
          <Route path="/social" component={Social} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile/:username" component={Profile} />
        </>
      )}
      
      {/* Public certificate routes */}
      <Route path="/certificate/:id" component={CertificateDetail} />
      <Route path="/report-theft/:id" component={ReportTheft} />
      
      {/* Profile showcase routes */}
      <Route path="/showcase/:username" component={ProfileShowcase} />
      <Route path="/portfolio/:username" component={ProfileShowcase} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
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
