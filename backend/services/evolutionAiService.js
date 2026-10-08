const { GoogleGenAI } = require('@google/genai');
const CodeVersion = require('../models/CodeVersion');
const Problem = require('../models/Problem');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeEvolutionAsync = async (versionId) => {
  try {
    const version = await CodeVersion.findById(versionId).populate('parentVersion');
    if (!version) return;

    const problem = await Problem.findById(version.problemId);
    if (!problem) return;

    let prompt = `You are a senior MERN stack engineer and algorithm expert.
Analyze the following code submission for the problem "${problem.title}".

Problem Description: ${problem.description}

Current Code:
\`\`\`${version.language}
${version.sourceCode}
\`\`\`

Current Status: ${version.status} (Runtime: ${version.runtime || 'N/A'}, Memory: ${version.memory || 'N/A'})
`;

    if (version.parentVersion) {
      prompt += `
Previous Code Version:
\`\`\`${version.parentVersion.language}
${version.parentVersion.sourceCode}
\`\`\`
`;
    }

    prompt += `
Please analyze this code and provide a JSON response with the following exact keys:
- "timeComplexity": The Big O time complexity of the Current Code (e.g., "O(n)").
- "spaceComplexity": The Big O space complexity of the Current Code (e.g., "O(1)").
- "whatImproved": A brief sentence explaining what improved compared to the previous version (or just general quality if no previous version exists).
- "needsWork": A brief sentence explaining what still needs optimization or improvement.
- "readiness": "Not Ready", "Getting There", or "Interview Ready".

Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    let responseText = result.text.trim();
    
    // Clean up potential markdown blocks
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7);
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3);
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }
    }

    const aiData = JSON.parse(responseText);

    version.timeComplexity = aiData.timeComplexity || 'Unknown';
    version.spaceComplexity = aiData.spaceComplexity || 'Unknown';
    version.aiAnalysis = {
      whatImproved: aiData.whatImproved || 'No improvements noted.',
      needsWork: aiData.needsWork || 'Needs further review.',
      readiness: aiData.readiness || 'Not Ready'
    };

    await version.save();
    console.log(`AI Evolution Analysis complete for version ${versionId}`);
  } catch (error) {
    console.error(`AI Evolution Analysis failed for version ${versionId}:`, error);
  }
};
