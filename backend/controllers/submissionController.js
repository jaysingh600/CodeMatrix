const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const CodeVersion = require('../models/CodeVersion');
const { executeSubmission } = require('../services/judge0Service');
const { analyzeEvolutionAsync } = require('../services/evolutionAiService');
const gamificationService = require('../services/gamificationService');

const submitCode = async (req, res) => {
  const { problemId, language, sourceCode, contestId } = req.body;
  const userId = req.user.id;

  if (!problemId || !language || !sourceCode) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Fetch all test cases for the problem
    const testCases = await TestCase.find({ problemId }).sort({ order: 1 });
    if (testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases found for this problem' });
    }

    const timeLimit = problem.timeLimit || 2000;
    const memoryLimit = problem.memoryLimit || 256000;

    const result = await executeSubmission(language, sourceCode, testCases, timeLimit, memoryLimit);

    // Save Submission
    const submission = new Submission({
      userId,
      problemId,
      language,
      sourceCode,
      status: result.status,
      executionTime: result.executionTime,
      memory: result.memory,
      output: result.output,
      error: result.error,
      passedCount: result.passedCount,
      totalCount: testCases.length,
      failedTestCase: result.failedTestCase,
      contestId: contestId || null
    });

    await submission.save();

    const io = req.app.get('socketio');

    if (result.status === 'Accepted') {
      const user = await require('../models/User').findById(userId);
      if (user) {
        user.problemsSolved = (user.problemsSolved || 0) + 1;
        await user.save();
        
        let xpAward = 10;
        if (problem.difficulty === 'Medium') xpAward = 25;
        if (problem.difficulty === 'Hard') xpAward = 50;
        
        await gamificationService.awardXP(userId, xpAward, 'Problem Solved', io);
        await gamificationService.checkAchievements(userId, io);
      }
    }

    // ICPC Contest Logic
    if (contestId) {
      const Contest = require('../models/Contest');
      const ContestParticipant = require('../models/ContestParticipant');
      const contest = await Contest.findById(contestId);
      
      if (contest && contest.status === 'Running') {
        const participant = await ContestParticipant.findOne({ contestId, userId });
        
        if (participant) {
          const contestProblem = contest.problems.find(p => p.problemId.toString() === problemId.toString());
          const points = contestProblem ? contestProblem.points : 0;
          
          let pStats = participant.problemStats.get(problemId.toString()) || { isSolved: false, failedAttempts: 0, solveTime: null };
          
          if (!pStats.isSolved) {
            if (result.status === 'Accepted') {
              pStats.isSolved = true;
              const timeElapsedMinutes = Math.floor((new Date() - new Date(contest.startTime)) / 60000);
              pStats.solveTime = timeElapsedMinutes;
              
              participant.score += points;
              // ICPC Penalty: time elapsed + (failed attempts * 20)
              participant.penalty += timeElapsedMinutes + (pStats.failedAttempts * 20);
            } else {
              pStats.failedAttempts += 1;
            }
            
            participant.problemStats.set(problemId.toString(), pStats);
            await participant.save();

            // Emit Leaderboard Update via Socket.IO
            const io = req.app.get('socketio');
            if (io) {
              const participantData = await ContestParticipant.findById(participant._id).populate('userId', 'username avatar');
              io.to(`contest_${contestId}`).emit('leaderboardUpdate', participantData);
            }
          }
        }
      }
    }

    // Create CodeVersion
    const latestVersion = await CodeVersion.findOne({ problemId, userId })
      .sort({ versionNumber: -1 });
    
    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const newVersion = await CodeVersion.create({
      userId,
      problemId,
      versionNumber,
      title: `Attempt ${versionNumber}`,
      language,
      sourceCode,
      status: result.status,
      runtime: result.executionTime,
      memory: result.memory,
      parentVersion: latestVersion ? latestVersion._id : null
    });

    // Trigger asynchronous AI analysis
    analyzeEvolutionAsync(newVersion._id);

    res.status(201).json(submission);

  } catch (error) {
    console.error(error);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Code evaluation engine (Judge0) is currently offline.' });
    }
    res.status(500).json({ message: error.message || 'Error submitting code' });
  }
};

const getSubmissionsHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 }).populate('problemId', 'title id');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ problemId: req.params.problemId, userId: req.user.id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title slug')
      .populate('failedTestCase');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.userId.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSolvedProblems = async (req, res) => {
  try {
    const solvedIds = await Submission.distinct('problemId', { userId: req.user.id, status: 'Accepted' });
    res.json(solvedIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runCode = async (req, res) => {
  const { problemId, language, sourceCode, customInput } = req.body;
  if (!problemId || !language || !sourceCode) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    let testCases = [];
    if (customInput) {
       // Mock a test case for custom input
       testCases = [{ input: customInput, expectedOutput: '', isHidden: false }];
    } else {
       testCases = await TestCase.find({ problemId, isHidden: false }).sort({ order: 1 });
       if (testCases.length === 0) {
         return res.status(400).json({ message: 'No sample test cases found' });
       }
    }

    const timeLimit = problem.timeLimit || 2000;
    const memoryLimit = problem.memoryLimit || 256000;
    const result = await executeSubmission(language, sourceCode, testCases, timeLimit, memoryLimit);
    
    // Do NOT save submission or points for RUN
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Code evaluation engine (Judge0) is currently offline.' });
    }
    res.status(500).json({ message: error.message || 'Error running code' });
  }
};

module.exports = {
  submitCode,
  getSubmissionsHistory,
  getProblemSubmissions,
  getSubmissionById,
  getSolvedProblems,
  runCode
};
