import { QueryClient, type QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (res.ok) return;

  if (res.status === 401) {
    throw new Error("401: Unauthorized");
  }

  let message = res.statusText;
  try {
    const errorBody = await res.text();
    if (errorBody) {
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error || errorJson.message || message;
      } catch {
        message = errorBody;
      }
    }
  } catch {
    // ignore
  }

  throw new Error(`${res.status}: ${message}`);
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Use environment variable for API URL, fallback to localhost for development
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
  
  // Don't set Content-Type for FormData - let the browser set it automatically
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(fullUrl, {
    credentials: "include",
    headers: {
      ...headers,
      ...options.headers,
    },
    ...options,
    body: options.body instanceof FormData ? options.body : 
          options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : 
          undefined,
  });

  await throwIfResNotOk(res);
  
  if (res.headers.get("Content-Type")?.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    // Use environment variable for API URL, fallback to localhost for development
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});