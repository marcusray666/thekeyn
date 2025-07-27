import { useAuth } from "@/hooks/useAuth";
import Welcome from "@/pages/welcome";
import AuthenticatedHome from "@/pages/authenticated-home";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedHome /> : <Welcome />;
}