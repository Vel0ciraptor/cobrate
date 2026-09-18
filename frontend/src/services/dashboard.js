import { api } from './api';

export const dashboardService = {
  async getSummary(period = 'month', from = null, to = null) {
    const params = new URLSearchParams({ period });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return api.get(`/dashboard?${params.toString()}`);
  },
};
