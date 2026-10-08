import { apiClient } from './config';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  
  getQuestions: async (params) => {
    const response = await apiClient.get('/admin/questions', { params });
    return response.data;
  },
  
  getQuestion: async (id) => {
    const response = await apiClient.get(`/admin/questions/${id}`);
    return response.data;
  },
  
  createQuestion: async (data) => {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  },
  
  updateQuestion: async (id, data) => {
    const response = await apiClient.put(`/admin/questions/${id}`, data);
    return response.data;
  },
  
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(`/admin/questions/${id}`);
    return response.data;
  },
  
  duplicateQuestion: async (id) => {
    const response = await apiClient.post(`/admin/questions/${id}/duplicate`);
    return response.data;
  },
  
  publishQuestion: async (id) => {
    const response = await apiClient.patch(`/admin/questions/${id}/publish`);
    return response.data;
  },
  
  archiveQuestion: async (id) => {
    const response = await apiClient.patch(`/admin/questions/${id}/archive`);
    return response.data;
  },

  getTestCases: async (questionId) => {
    const response = await apiClient.get(`/admin/questions/${questionId}/testcases`);
    return response.data;
  },

  createTestCase: async (questionId, data) => {
    const response = await apiClient.post(`/admin/questions/${questionId}/testcases`, data);
    return response.data;
  },

  updateTestCase: async (testCaseId, data) => {
    const response = await apiClient.put(`/admin/testcases/${testCaseId}`, data);
    return response.data;
  },

  deleteTestCase: async (testCaseId) => {
    const response = await apiClient.delete(`/admin/testcases/${testCaseId}`);
    return response.data;
  },

  reorderTestCases: async (questionId, testCases) => {
    const response = await apiClient.patch(`/admin/questions/${questionId}/testcases/reorder`, { testCases });
    return response.data;
  },

  bulkImportTestCases: async (questionId, data) => {
    const response = await apiClient.post(`/admin/questions/${questionId}/testcases/bulk`, data);
    return response.data;
  },

  getUsers: async (params) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getContests: async (params) => {
    const response = await apiClient.get('/admin/contests', { params });
    return response.data;
  },

  getGlobalTestCases: async (params) => {
    const response = await apiClient.get('/admin/testcases', { params });
    return response.data;
  }
};
