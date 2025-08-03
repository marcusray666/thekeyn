import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Profile from "./profile";
import Home from "./home";

// Component that shows user's own profile when logged in, or redirects to login
export default function UserProfile() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Home />;
  }

  // If authenticated but no user data yet, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show the user's profile page
  return <Profile />;
}