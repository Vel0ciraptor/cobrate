import { api } from './api';

export const authService = {
  async login(username, password) {
    const data = await api.post('/auth/login', { username, password });
    if (data.token) {
      localStorage.setItem('cobrate_token', data.token);
      localStorage.setItem('cobrate_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('cobrate_token');
    localStorage.removeItem('cobrate_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('cobrate_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('cobrate_token');
  },

  async verifySession() {
    return api.get('/auth/me');
  },
};
