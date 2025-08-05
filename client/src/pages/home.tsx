import { useAuth } from "@/hooks/useAuth";
import WelcomeClean from "@/pages/welcome-clean";
import DashboardClean from "@/pages/dashboard-clean";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardClean /> : <WelcomeClean />;
}