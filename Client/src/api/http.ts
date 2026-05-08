export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/src/assets") || url.startsWith("data:")) {
    return url;
  }
  // ensure we don't have double slashes if url starts with /
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return base + (url.startsWith("/") ? url : "/" + url);
}


export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.data && !(options.data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.data);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!response.ok) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

export function get<T>(endpoint: string, options?: RequestOptions) {
  return request<T>(endpoint, { ...options, method: "GET" });
}

export function post<T>(endpoint: string, data?: any, options?: RequestOptions) {
  return request<T>(endpoint, { ...options, method: "POST", data });
}

export function put<T>(endpoint: string, data?: any, options?: RequestOptions) {
  return request<T>(endpoint, { ...options, method: "PUT", data });
}

export function del<T>(endpoint: string, options?: RequestOptions) {
  return request<T>(endpoint, { ...options, method: "DELETE" });
}
