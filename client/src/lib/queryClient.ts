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
  // Use relative URLs for unified server
  const fullUrl = url.startsWith('/') ? url : `/${url}`;
  
  console.log('API REQUEST:', { url: fullUrl, method: options.method, hasBody: !!options.body });
  
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

  console.log('API RESPONSE:', { 
    status: res.status, 
    url: fullUrl,
    hasSetCookie: res.headers.get('Set-Cookie') ? 'yes' : 'no',
    contentType: res.headers.get('Content-Type')
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
    // Use relative URLs for unified server
    const fullUrl = url.startsWith('/') ? url : `/${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });



    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('Returning null for 401');
      return null;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
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