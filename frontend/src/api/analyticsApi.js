import { apiClient } from './config';

export const analyticsApi = {
  getUserAnalytics: async () => {
    const response = await apiClient.get('/analytics/user');
    return response.data;
  },
  getUserHeatmap: async () => {
    const response = await apiClient.get('/analytics/user/heatmap');
    return response.data;
  },
  getAdminAnalytics: async () => {
    const response = await apiClient.get('/analytics/admin');
    return response.data;
  }
};
