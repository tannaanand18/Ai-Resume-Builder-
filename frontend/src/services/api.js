const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_TIMEOUT = 30000;
const SLOW_TIMEOUT = 60000;
const SLOW_ENDPOINTS = ['/auth/forgot-password', '/share/email'];

// iOS Safari fix - get token from localStorage
const getToken = () => localStorage.getItem('access_token');

const getAuthHeaders = (extra = {}) => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  };
};

const fetchWithTimeout = (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((error) => {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout / 1000}s`);
      }
      throw error;
    })
    .finally(() => clearTimeout(timeoutId));
};

const getTimeout = (endpoint) =>
  SLOW_ENDPOINTS.some(e => endpoint.includes(e)) ? SLOW_TIMEOUT : DEFAULT_TIMEOUT;

const api = {
  get: async (endpoint) => {
    const res = await fetchWithTimeout(
      `${API_URL}/api${endpoint}`,
      { 
        method: 'GET', 
        credentials: 'include',
        headers: getAuthHeaders()
      },
      getTimeout(endpoint)
    );
    if (!res.ok) {
      const error = await res.json();
      throw { response: { status: res.status, data: error } };
    }
    return { data: await res.json() };
  },

  post: async (endpoint, body) => {
    const res = await fetchWithTimeout(
      `${API_URL}/api${endpoint}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      },
      getTimeout(endpoint)
    );
    // Save token from response header (iOS fallback)
    const token = res.headers.get('X-Access-Token');
    if (token) localStorage.setItem('access_token', token);

    if (!res.ok) {
      const error = await res.json();
      throw { response: { status: res.status, data: error } };
    }
    return { data: await res.json() };
  },

  put: async (endpoint, body) => {
    const res = await fetchWithTimeout(
      `${API_URL}/api${endpoint}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body),
      },
      getTimeout(endpoint)
    );
    if (!res.ok) {
      const error = await res.json();
      throw { response: { status: res.status, data: error } };
    }
    return { data: await res.json() };
  },

  delete: async (endpoint) => {
    const res = await fetchWithTimeout(
      `${API_URL}/api${endpoint}`,
      { 
        method: 'DELETE', 
        credentials: 'include',
        headers: getAuthHeaders()
      },
      getTimeout(endpoint)
    );
    if (!res.ok) {
      const error = await res.json();
      throw { response: { status: res.status, data: error } };
    }
    return { data: await res.json() };
  },
};

export default api;
export { API_URL };
