import { apiClient } from './config';

export const problemsApi = {
  getProblems: async (params) => {
    const { data } = await apiClient.get('/problems', { params });
    return data;
  },
  getProblemById: async (id) => {
    const { data } = await apiClient.get(`/problems/${id}`);
    return data;
  },
  getProblemBySlug: async (slug) => {
    const { data } = await apiClient.get(`/problems/slug/${slug}`);
    return data;
  },
  getProblemExamples: async (id) => {
    const { data } = await apiClient.get(`/problems/${id}/examples`);
    return data;
  }
};

