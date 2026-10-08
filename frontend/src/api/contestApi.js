import { apiClient } from './config';

export const contestApi = {
  // Public
  getContests: async () => {
    const response = await apiClient.get('/contests');
    return response.data;
  },
  getContestById: async (id) => {
    const response = await apiClient.get(`/contests/${id}`);
    return response.data;
  },
  getContestLeaderboard: async (id) => {
    const response = await apiClient.get(`/contests/${id}/leaderboard`);
    return response.data;
  },

  // User Protected
  joinContest: async (id) => {
    const response = await apiClient.post(`/contests/${id}/join`);
    return response.data;
  },
  getUserContestData: async (id) => {
    const response = await apiClient.get(`/contests/${id}/me`);
    return response.data;
  },

  // Admin Protected
  createContest: async (data) => {
    const response = await apiClient.post('/contests', data);
    return response.data;
  },
  updateContest: async (id, data) => {
    const response = await apiClient.put(`/contests/${id}`, data);
    return response.data;
  },
  deleteContest: async (id) => {
    const response = await apiClient.delete(`/contests/${id}`);
    return response.data;
  }
};
