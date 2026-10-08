import { apiClient } from './config';

export const mentorApi = {
  getHistory: async (problemId) => {
    const { data } = await apiClient.get(`/mentor/history/${problemId}`);
    return data;
  },
  
  sendMessage: async (problemId, language, sourceCode, message, additionalContext = null) => {
    const { data } = await apiClient.post('/mentor/chat', {
      problemId,
      language,
      sourceCode,
      message,
      additionalContext
    });
    return data;
  },

  clearHistory: async (problemId) => {
    const { data } = await apiClient.delete(`/mentor/history/${problemId}`);
    return data;
  }
};
