const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateContent = async (systemInstruction, prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
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

const buildContext = (problem, language, sourceCode, failedTestCase = null) => {
  let context = `
Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Description:
${problem.description}

Constraints:
${problem.constraints.join('\n')}

Selected Language: ${language}
Current Code:
\`\`\`${language}
${sourceCode}
\`\`\`
`;
  if (failedTestCase) {
    context += `
The code recently failed on this test case:
Input:
${failedTestCase.input}
Expected Output:
${failedTestCase.expectedOutput}
`;
  }
  return context;
};

const SYSTEM_PROMPT = `You are CodeMatrix Mentor, an AI coding instructor. 
Help the student solve the problem through guided learning. 
Your goal is to be highly educational.
Do not reveal the complete solution unless the requested hint type is Full Solution.
Use markdown for formatting. Make it elegant and readable. Use code blocks with language tags when appropriate.`;

const generateConceptHint = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide a "Concept Hint".
Explain which computer science concept is relevant (e.g., HashMap, Two pointers, Binary search, Dynamic programming).
Do not provide any code or the full solution. Keep it concise.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const generatePatternHint = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide a "Pattern Hint".
Explain the problem pattern (e.g., sliding window, fast/slow pointers, top k elements).
Do not provide any code. Keep it concise.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const generateAlgorithmHint = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide an "Algorithm Hint".
Provide a high-level strategy to solve the problem. Use bullet points.
Do not provide actual code.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const generatePseudocode = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide "Pseudocode".
Provide language-independent pseudocode for the solution.
Make it easy to understand but do not write the actual syntax of the chosen language.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const generateSkeleton = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide a "Code Skeleton".
Provide a partially completed template in ${language}. Use comments like // TODO to indicate where the user needs to write logic.
Do not provide the final implementation.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const debugCode = async (problem, language, sourceCode, error) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
Error Output: ${error || 'None'}
  
Task: Provide "Debug My Code".
Analyze the user's current code. Identify syntax issues, logical errors, incorrect conditions, or missing return statements.
Explain why the code fails. Do NOT provide the corrected code, only point out the flaws and hint at how to fix them.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const optimizeCode = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide "Optimize Complexity".
Analyze the time and space complexity of the current code. Suggest improvements if possible (e.g., moving from O(n^2) to O(n)).
Explain the data structure or approach that enables the optimization, but don't give the full solution code.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const explainMistake = async (problem, language, sourceCode, failedTestCase) => {
  const prompt = `${buildContext(problem, language, sourceCode, failedTestCase)}
  
Task: Provide "Explain My Mistake".
Explain the likely reason why the user's code fails on the provided test case.
Point out edge cases or logical flaws without giving away the complete fix.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const analyzeComplexity = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide "Complexity Analysis".
Analyze the user's code and return the time complexity, space complexity, best case, and worst case.
Explain it in simple language.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const generateFullSolution = async (problem, language, sourceCode) => {
  const prompt = `${buildContext(problem, language, sourceCode)}
  
Task: Provide "Full Solution".
Provide the complete, optimal code to solve the problem in ${language}.
Include line-by-line explanations, complexity analysis, and mention alternative approaches if applicable.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const explainVisualizerStep = async (context) => {
  const prompt = `You are a computer science instructor inside an interactive Algorithm Visualizer.
The student has paused the animation and wants to know what is happening right now.

Here is the exact state of the algorithm at this very moment:
${context}

Task: Explain this specific step to the student.
- Why are these elements being compared or swapped?
- What is the logic behind this current line of pseudocode?
- What will happen next in the algorithm based on this state?

Be conversational, concise, and highly educational. Do NOT output a full essay. Just focus on explaining THIS EXACT MOMENT in time.`;

  return generateContent(SYSTEM_PROMPT, prompt);
};

const summarizeNote = async (noteContent) => {
  const prompt = `Task: Summarize the following developer note.
Extract the main points, key takeaways, and relevant code snippets if essential.
Keep it concise and use markdown formatting.

Note Content:
${noteContent}`;
  return generateContent(SYSTEM_PROMPT, prompt);
};

const explainNoteSelection = async (selectionText) => {
  const prompt = `Task: Explain the following selected text from a developer's note.
Explain the concepts clearly as if tutoring a junior developer.

Selected Text:
${selectionText}`;
  return generateContent(SYSTEM_PROMPT, prompt);
};

module.exports = {
  generateConceptHint,
  generatePatternHint,
  generateAlgorithmHint,
  generatePseudocode,
  generateSkeleton,
  debugCode,
  optimizeCode,
  explainMistake,
  analyzeComplexity,
  generateFullSolution,
  explainVisualizerStep,
  summarizeNote,
  explainNoteSelection
};
