import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug log to trace authentication state
  console.log('useAuth:', { user, isLoading, error });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}