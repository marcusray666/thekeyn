import { useQuery } from "@tanstack/react-query";
import { useSessionTimeout } from "./useSessionTimeout";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Initialize session timeout - always call hooks unconditionally
  const sessionTimeout = useSessionTimeout({
    timeoutMinutes: 60, // 1 hour
    warningMinutes: 5,  // Warn 5 minutes before
    enabled: !!user, // Pass enabled flag instead of conditional hook call
  });

  // Debug log to trace authentication state
  console.log('useAuth STATE:', { 
    hasUser: !!user, 
    userId: user?.id,
    username: user?.username,
    isLoading, 
    error: error?.message || error,
    queryKey: '/api/auth/user'
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: sessionTimeout.logout,
    updateActivity: sessionTimeout.updateActivity,
  };
}