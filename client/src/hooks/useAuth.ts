import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isSuccess } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug log to trace authentication state
  console.log('useAuth:', { user: !!user, isLoading, error: !!error, isSuccess, data: user });

  // Consider loading complete when query is successful (even if user is null)
  const loadingComplete = isSuccess || !!error;

  return {
    user,
    isLoading: !loadingComplete,
    isAuthenticated: !!user,
    error,
  };
}