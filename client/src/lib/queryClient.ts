import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = await res.text();
      let message = res.statusText;
      
      if (text) {
        try {
          const json = JSON.parse(text);
          message = json.error || json.message || text;
        } catch {
          message = text;
        }
      }
      
      throw new Error(message);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Always use absolute URL to backend server
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
  
  console.log("Making API request to:", fullUrl);
  console.log("Request options:", options);
  
  try {
    const res = await fetch(fullUrl, {
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log("Fetch completed successfully");
    return await handleResponse(res);
  } catch (networkError) {
    console.error("Network error:", networkError);
    throw new Error(`Network error: ${networkError.message}`);
  }
}

async function handleResponse(res: Response) {

  console.log("Response status:", res.status);
  console.log("Response headers:", Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    let errorMessage = `${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      console.log("Error response body:", errorData);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      console.log("Could not parse error response as JSON");
    }
    throw new Error(errorMessage);
  }

  const responseData = await res.json();
  console.log("Response data:", responseData);
  return responseData;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      mode: "cors",
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
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
