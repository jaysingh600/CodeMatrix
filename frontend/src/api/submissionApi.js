import { apiClient } from './config';

export const submissionApi = {
  submitCode: async (problemId, language, sourceCode, contestId = null) => {
    const { data } = await apiClient.post('/submissions/submit', {
      problemId,
      language,
      sourceCode,
      contestId
    });
    return data;
  },
  getHistory: async () => {
    const { data } = await apiClient.get('/submissions/history');
    return data;
  },
  getSolvedProblems: async () => {
    const { data } = await apiClient.get('/submissions/solved');
    return data;
  },
  getProblemSubmissions: async (problemId) => {
    const { data } = await apiClient.get(`/submissions/problem/${problemId}`);
    return data;
  },
  getSubmissionById: async (id) => {
    const { data } = await apiClient.get(`/submissions/${id}`);
    return data;
  }
};

