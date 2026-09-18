// Base HTTP fetch client with authorization header injection and error handling

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cobrate_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('cobrate_token');
    localStorage.removeItem('cobrate_user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Error en la petición');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, body) => request(endpoint, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  }),
};
