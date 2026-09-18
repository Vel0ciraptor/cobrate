import { api, request } from './api';

export const clientsService = {
  async getClients(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/clients${query}`);
  },

  async getClientById(id) {
    return api.get(`/clients/${id}`);
  },

  async createClient(clientData) {
    return api.post('/clients', clientData);
  },

  async updateClient(id, clientData) {
    return api.put(`/clients/${id}`, clientData);
  },

  async deleteClient(id, password) {
    return request(`/clients/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    });
  },
};
