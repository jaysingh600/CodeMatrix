import { apiClient } from './config';

export const aiApi = {
  getHint: async (problemId, language, code, hintType, failedSubmissionId = null) => {
    const response = await apiClient.post('/ai/hint', {
      problemId,
      language,
      code,
      hintType,
      failedSubmissionId
    });
    return response.data;
  },

  explainVisualizerStep: async (context) => {
    const response = await apiClient.post('/ai/visualizer-explain', { context });
    return response.data;
  }
};
