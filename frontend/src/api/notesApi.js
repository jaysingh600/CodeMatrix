import { apiClient } from './config';

export const notesApi = {
  // Folders
  getFolders: async () => {
    const response = await apiClient.get('/notes/folders');
    return response.data;
  },
  createFolder: async (data) => {
    const response = await apiClient.post('/notes/folders', data);
    return response.data;
  },
  updateFolder: async (id, data) => {
    const response = await apiClient.put(`/notes/folders/${id}`, data);
    return response.data;
  },
  deleteFolder: async (id) => {
    const response = await apiClient.delete(`/notes/folders/${id}`);
    return response.data;
  },

  // Notes
  getNotes: async (params) => {
    const response = await apiClient.get('/notes', { params });
    return response.data;
  },
  getNoteById: async (id) => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },
  createNote: async (data) => {
    const response = await apiClient.post('/notes', data);
    return response.data;
  },
  updateNote: async (id, data) => {
    const response = await apiClient.put(`/notes/${id}`, data);
    return response.data;
  },
  deleteNote: async (id) => {
    const response = await apiClient.delete(`/notes/${id}`);
    return response.data;
  },

  // AI Actions
  aiAction: async (action, text) => {
    const response = await apiClient.post('/ai/notes/action', { action, text });
    return response.data;
  }
};
