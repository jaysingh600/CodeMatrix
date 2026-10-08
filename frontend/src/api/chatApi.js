import { apiClient } from './config';

export const chatApi = {
  getProblemRoom: async (problemId) => {
    const response = await apiClient.get(`/chat/rooms/problem/${problemId}`);
    return response.data;
  },
  getRoomMessages: async (roomId, limit = 50, skip = 0) => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages?limit=${limit}&skip=${skip}`);
    return response.data;
  },
  togglePinMessage: async (messageId) => {
    const response = await apiClient.put(`/chat/messages/${messageId}/pin`);
    return response.data;
  },
  markAsSolution: async (messageId) => {
    const response = await apiClient.put(`/chat/messages/${messageId}/solution`);
    return response.data;
  },
  getUserRooms: async () => {
    const response = await apiClient.get('/chat/user/rooms');
    return response.data;
  },
  createPrivateRoom: async (data) => {
    const response = await apiClient.post('/chat/rooms', data);
    return response.data;
  },
  joinPrivateRoom: async (roomCode) => {
    const response = await apiClient.post('/chat/rooms/join', { roomCode });
    return response.data;
  },
  deleteMessage: async (messageId) => {
    const response = await apiClient.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
  editMessage: async (messageId, content) => {
    const response = await apiClient.put(`/chat/messages/${messageId}`, { message: content });
    return response.data;
  },
  generateOTP: async (roomId) => {
    const response = await apiClient.post(`/chat/rooms/${roomId}/generate-otp`);
    return response.data;
  }
};
