const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are CodeMatrix Mentor, an AI Socratic coding tutor and technical interviewer.
Core Principles:
1. NEVER reveal the complete final solution code unless the user explicitly demands "Give me the full solution".
2. Act like a patient, encouraging Socratic tutor. Break problems down.
3. If the user asks for help starting, ask them to identify the input, output, and basic approach first.
4. If the user provides code that fails, do NOT rewrite it for them. Point out the line or the logic flaw and ask how they might fix it.
5. Discuss time and space complexity. Encourage edge-case thinking.
6. Use elegant markdown, code blocks (with language tags), and tables for dry-runs.
7. Adapt to the user's skill level.
Your goal is to teach the user *how* to think, not just give them the answer.`;

const buildContextMessage = (problem, language, sourceCode, additionalContext) => {
  let context = `
[SYSTEM CONTEXT - DO NOT ACKNOWLEDGE THIS BLOCK TO THE USER]
Current Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Constraints: ${problem.constraints?.join(', ')}

User's current language: ${language}
User's current code in editor:
\`\`\`${language}
${sourceCode}
\`\`\`
`;
  if (additionalContext) {
    context += `\nAdditional Context: ${additionalContext}\n`;
  }
  context += `[END SYSTEM CONTEXT]\n\n`;
  return context;
};

const chatWithMentor = async (problem, language, sourceCode, userMessage, historyMessages = [], additionalContext = null) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const startTime = Date.now();

  // Format history for Gemini
  const contents = historyMessages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Build the new user message with system context prepended
  const contextBlock = buildContextMessage(problem, language, sourceCode, additionalContext);
  const finalUserMessage = contextBlock + userMessage;

  contents.push({
    role: 'user',
    parts: [{ text: finalUserMessage }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    }
  });

  const responseTime = Date.now() - startTime;
  const tokenUsage = response.usageMetadata?.totalTokenCount || 0;

  return {
    text: response.text,
    responseTime,
    tokenUsage
  };
};

module.exports = {
  chatWithMentor
};
