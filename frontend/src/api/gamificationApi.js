import { apiClient } from './config';

export const gamificationApi = {
  getNotifications: async () => {
    const response = await apiClient.get('/gamification/notifications');
    return response.data;
  },
  markNotificationRead: async (id) => {
    const response = await apiClient.put(`/gamification/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await apiClient.put('/gamification/notifications/read-all');
    return response.data;
  },
  getMyAchievements: async () => {
    const response = await apiClient.get('/gamification/achievements');
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await apiClient.get('/gamification/leaderboard');
    return response.data;
  }
};
