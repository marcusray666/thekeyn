import { useAuth } from "@/hooks/useAuth";
import WelcomeClean from "@/pages/welcome-clean";
import PremiumHome from "@/pages/premium-home";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <PremiumHome /> : <WelcomeClean />;
}