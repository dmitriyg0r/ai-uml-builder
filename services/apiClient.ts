const resolveApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3001';
};

export const API_URL = resolveApiUrl();

const TOKEN_KEY = 'auth:token';

export const getAuthToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Network request failed';
    const message = `Network error while calling ${API_URL}${path}: ${rawMessage}`;
    throw new ApiError(message, 0, { cause: rawMessage });
  }

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message = payload?.error || response.statusText || 'Request failed';
    throw new ApiError(message, response.status, payload);
  }

  return payload;
};
