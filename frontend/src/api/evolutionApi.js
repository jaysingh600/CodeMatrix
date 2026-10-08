import { apiClient } from './config';

export const evolutionApi = {
  getProblemVersions: async (problemId) => {
    const response = await apiClient.get(`/evolution/${problemId}`);
    return response.data;
  },

  getVersionById: async (versionId) => {
    const response = await apiClient.get(`/evolution/version/${versionId}`);
    return response.data;
  },

  createCheckpoint: async (data) => {
    const response = await apiClient.post('/evolution/checkpoint', data);
    return response.data;
  },

  restoreVersion: async (versionId) => {
    const response = await apiClient.post(`/evolution/restore/${versionId}`);
    return response.data;
  },

  updateVersionNote: async (versionId, data) => {
    const response = await apiClient.put(`/evolution/version/${versionId}`, data);
    return response.data;
  },

  deleteVersion: async (versionId) => {
    const response = await apiClient.delete(`/evolution/version/${versionId}`);
    return response.data;
  }
};
