import { apiClient } from './config';

export const codeApi = {
  runCode: async (language, sourceCode, stdin) => {
    const { data } = await apiClient.post('/code/run', {
      language,
      sourceCode,
      stdin
    });
    return data;
  }
};

