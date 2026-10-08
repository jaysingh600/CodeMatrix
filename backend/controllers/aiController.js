const HintRequest = require('../models/HintRequest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const aiService = require('../services/aiService');

const HINT_SCORES = {
  Concept: 5,
  Pattern: 4,
  Algorithm: 3,
  Pseudocode: 2,
  CodeSkeleton: 1,
  Debug: 1,
  Optimize: 2,
  ExplainMistake: 1,
  Complexity: 1,
  FullSolution: -10
};

const getHint = async (req, res) => {
  const { problemId, language, sourceCode, hintType, failedSubmissionId } = req.body;
  const userId = req.user.id;

  if (!problemId || !hintType || !language) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let failedTestCase = null;
    let errorOutput = null;

    if (failedSubmissionId) {
      const sub = await Submission.findById(failedSubmissionId).populate('failedTestCase');
      if (sub) {
        failedTestCase = sub.failedTestCase;
        errorOutput = sub.error;
      }
    }

    let result;

    switch (hintType) {
      case 'Concept':
        result = await aiService.generateConceptHint(problem, language, sourceCode);
        break;
      case 'Pattern':
        result = await aiService.generatePatternHint(problem, language, sourceCode);
        break;
      case 'Algorithm':
        result = await aiService.generateAlgorithmHint(problem, language, sourceCode);
        break;
      case 'Pseudocode':
        result = await aiService.generatePseudocode(problem, language, sourceCode);
        break;
      case 'CodeSkeleton':
        result = await aiService.generateSkeleton(problem, language, sourceCode);
        break;
      case 'Debug':
        result = await aiService.debugCode(problem, language, sourceCode, errorOutput);
        break;
      case 'Optimize':
        result = await aiService.optimizeCode(problem, language, sourceCode);
        break;
      case 'ExplainMistake':
        result = await aiService.explainMistake(problem, language, sourceCode, failedTestCase);
        break;
      case 'Complexity':
        result = await aiService.analyzeComplexity(problem, language, sourceCode);
        break;
      case 'FullSolution':
        result = await aiService.generateFullSolution(problem, language, sourceCode);
        break;
      default:
        return res.status(400).json({ message: 'Invalid hint type' });
    }

    // Log the request
    const hintReq = await HintRequest.create({
      userId,
      problemId,
      hintType,
      language,
      tokenUsage: result.tokenUsage,
      responseTime: result.responseTime
    });

    // Update User score and aiHintsUsed
    const scoreChange = HINT_SCORES[hintType] || 0;
    
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        aiHintsUsed: 1,
        thinkingScore: scoreChange
      }
    });

    res.json({
      title: `${hintType} Hint`,
      hint: result.text,
      scoreChange
    });

  } catch (error) {
    console.error('AI Hint Error:', error);
    res.status(500).json({ message: error.message || 'Error generating hint' });
  }
};

const explainVisualizerStep = async (req, res) => {
  const { context } = req.body;
  
  if (!context) {
    return res.status(400).json({ message: 'Missing visualizer context' });
  }

  try {
    const explanation = await aiService.explainVisualizerStep(context);
    res.json({ explanation: explanation.text });
  } catch (error) {
    console.error('AI Visualizer Explain Error:', error);
    res.status(500).json({ message: error.message || 'Error generating explanation' });
  }
};

const aiNoteAction = async (req, res) => {
  const { action, text } = req.body; // action: 'summarize' or 'explain'
  
  if (!text) {
    return res.status(400).json({ message: 'Missing text content' });
  }

  try {
    let result;
    if (action === 'summarize') {
      result = await aiService.summarizeNote(text);
    } else if (action === 'explain') {
      result = await aiService.explainNoteSelection(text);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    res.json({ result: result.text });
  } catch (error) {
    console.error('AI Note Action Error:', error);
    res.status(500).json({ message: error.message || 'Error executing AI action' });
  }
};

module.exports = {
  getHint,
  explainVisualizerStep,
  aiNoteAction
};
