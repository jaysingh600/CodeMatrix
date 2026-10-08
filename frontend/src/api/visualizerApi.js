import { apiClient } from './config';

export const visualizerApi = {
  getPreferences: async () => {
    const response = await apiClient.get('/visualizer/preferences');
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await apiClient.put('/visualizer/preferences', data);
    return response.data;
  },

  trackAlgorithm: async (algorithmId) => {
    const response = await apiClient.post('/visualizer/track', { algorithmId });
    return response.data;
  }
};
