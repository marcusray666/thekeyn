import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenLoader } from "@/components/ui/liquid-glass-loader";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UploadPage from "@/pages/upload";
import AuthenticatedUpload from "@/pages/authenticated-upload";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user-dashboard";
import Certificates from "@/pages/certificates";
import MyCertificates from "@/pages/my-certificates";
import CertificateDetail from "@/pages/certificate-detail";
import ReportTheft from "@/pages/report-theft";
import Analytics from "@/pages/analytics";
import BulkOperations from "@/pages/bulk-operations";
import Settings from "@/pages/settings";
import CopyrightRegistration from "@/pages/copyright-registration";
import NFTMinting from "@/pages/nft-minting";
import SubscriptionManagement from "@/pages/subscription-management";
import SocialFeed from "@/pages/social-feed";
import NotFound from "@/pages/not-found";

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
        {isAuthenticated ? <UserDashboard /> : <Welcome />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/upload" component={UploadPage} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/home" component={Home} />
          <Route path="/certificates" component={MyCertificates} />
          <Route path="/upload-work" component={AuthenticatedUpload} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/bulk-operations" component={BulkOperations} />
          <Route path="/copyright-registration" component={CopyrightRegistration} />
          <Route path="/nft-minting" component={NFTMinting} />
          <Route path="/subscription" component={SubscriptionManagement} />
          <Route path="/social" component={SocialFeed} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      {/* Public certificate routes */}
      <Route path="/certificate/:id" component={CertificateDetail} />
      <Route path="/report-theft/:id" component={ReportTheft} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
