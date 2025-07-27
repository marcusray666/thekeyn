import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true, // Refresh when window gains focus
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache (updated from cacheTime in v5)
  });

  // Debug log to trace authentication state
  console.log('useAuth:', { user: !!user, isLoading, error: !!error });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
}