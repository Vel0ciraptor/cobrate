import { api } from './api';

export const paymentsService = {
  async getPayments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.client_id) params.append('client_id', filters.client_id);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/payments${query}`);
  },

  async createPayment(paymentData) {
    return api.post('/payments', paymentData);
  },

  async deletePayment(id) {
    return api.delete(`/payments/${id}`);
  },
};
