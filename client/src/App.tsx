import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/premium/top-nav";
import { BottomNav } from "@/components/premium/bottom-nav";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";


import Login from "@/pages/login-clean";
import Register from "@/pages/register-clean";

import PremiumHome from "@/pages/premium-home";
import PremiumUpload from "@/pages/premium-upload";
import PremiumProfile from "@/pages/premium-profile";
import CreatePost from "@/pages/create-post";

import PremiumCertificates from "@/pages/premium-certificates";
import CertificateDetail from "@/pages/certificate-detail";
import ReportTheft from "@/pages/report-theft";
import Analytics from "@/pages/analytics";
import BulkOperations from "@/pages/bulk-operations";
import PremiumSettings from "@/pages/premium-settings";
import Security from "@/pages/security";
import Profile from "@/pages/profile";
import Portfolio from "@/pages/portfolio";
import CertificateGuide from "@/pages/certificate-guide";

import NFTMinting from "@/pages/nft-minting";
import NFTStudio from "@/pages/nft-studio";
import SimplifiedNFT from "@/pages/simplified-nft";

import Subscription from "@/pages/subscription";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancelled from "@/pages/subscription-cancelled";

import Social from "@/pages/social";
import Messages from "@/pages/messages";
import Followers from "@/pages/followers";
import ShareDemo from "@/pages/share-demo";
import BackgroundDemo from "@/pages/background-demo";

import Studio from "@/pages/studio";
import AdminDashboard from "@/pages/admin-dashboard";


import WelcomeClean from "@/pages/welcome-clean";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/welcome" component={WelcomeClean} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/upload" component={PremiumUpload} />
      <Route path="/create-post" component={CreatePost} />

      
      {/* Home route - dynamic based on auth status */}
      <Route path="/" component={PremiumHome} />
      
      {/* Protected routes */}
      <Route path="/home" component={PremiumHome} />
      <Route path="/dashboard" component={PremiumHome} />
      <Route path="/studio" component={Studio} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/certificates" component={PremiumCertificates} />
      <Route path="/my-certificates" component={PremiumCertificates} />
      <Route path="/upload-work" component={PremiumUpload} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/bulk-operations" component={BulkOperations} />

      <Route path="/nft-minting" component={NFTMinting} />
      <Route path="/nft-studio" component={NFTStudio} />
      <Route path="/nft-simple" component={SimplifiedNFT} />

      <Route path="/verify" component={PremiumCertificates} />
      <Route path="/social" component={Social} />
      <Route path="/messages" component={Messages} />
      <Route path="/user/:userId" component={Profile} />
      <Route path="/followers" component={Followers} />
      <Route path="/share-demo" component={ShareDemo} />
      <Route path="/background-demo" component={BackgroundDemo} />
      <Route path="/settings" component={PremiumSettings} />
      <Route path="/security" component={Security} />
      <Route path="/certificate-guide" component={CertificateGuide} />
      <Route path="/report-theft" component={ReportTheft} />
      <Route path="/profile/:username" component={PremiumProfile} />
      <Route path="/profile" component={PremiumProfile} />
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

function AppContent() {
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
    retry: false,
  });
  
  const isAuthenticated = !!currentUser;
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-inter light-theme">
        {/* Skip Links for Screen Readers */}
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#FE3F5E] text-white px-4 py-2 rounded">
          Skip to main content
        </a>
        {/* Only show navigation for authenticated users */}
        {isAuthenticated && <TopNav />}
        <main id="main-content">
          <Router />
        </main>
        {isAuthenticated && <BottomNav />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="loggin-ui-theme">
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
