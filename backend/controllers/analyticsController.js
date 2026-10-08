const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Contest = require('../models/Contest');

// ===================== USER ANALYTICS ===================== //

exports.getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Problems Solved (distinct problemIds with 'Accepted' status)
    const solvedSubmissions = await Submission.find({ userId, status: 'Accepted' }).distinct('problemId');
    const totalSolved = solvedSubmissions.length;

    // 2. Acceptance Rate
    const totalSubmissions = await Submission.countDocuments({ userId });
    const totalAcceptedSubmissions = await Submission.countDocuments({ userId, status: 'Accepted' });
    const acceptanceRate = totalSubmissions > 0 ? ((totalAcceptedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

    // 3. Difficulty Distribution (Easy, Medium, Hard)
    // We need to find the distinct problems solved and group by difficulty
    const solvedProblemsData = await Problem.find({ _id: { $in: solvedSubmissions } }, 'difficulty');
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
    solvedProblemsData.forEach(p => {
      if (difficultyCount[p.difficulty] !== undefined) difficultyCount[p.difficulty]++;
    });

    // 4. Topic Mastery
    // Fetch all attempted problems (distinct problemIds, any status)
    const attemptedSubmissions = await Submission.find({ userId }).distinct('problemId');
    const allAttemptedProblemsData = await Problem.find({ _id: { $in: attemptedSubmissions } }, 'topic');
    
    const topicStats = {};
    allAttemptedProblemsData.forEach(p => {
      p.topic.forEach(t => {
        if (!topicStats[t]) topicStats[t] = { name: t, attempted: 0, solved: 0 };
        topicStats[t].attempted++;
        if (solvedSubmissions.some(id => id.toString() === p._id.toString())) {
          topicStats[t].solved++;
        }
      });
    });

    const topicMastery = Object.values(topicStats).map(t => ({
      ...t,
      masteryScore: Math.round((t.solved / t.attempted) * 100) || 0
    })).sort((a, b) => b.attempted - a.attempted);

    // 5. Weekly Activity (Last 7 days of submissions)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyActivityRaw = await Submission.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Format weekly activity to ensure 7 days exist
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = weeklyActivityRaw.find(x => x._id === dateStr);
      weeklyActivity.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: dayData ? dayData.submissions : 0,
        accepted: dayData ? dayData.accepted : 0
      });
    }

    res.json({
      totalSolved,
      totalAttempted: attemptedSubmissions.length,
      acceptanceRate,
      difficultyCount,
      topicMastery,
      weeklyActivity
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserHeatmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const heatmapData = await Submission.aggregate([
      { $match: { userId } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(heatmapData);
  } catch (error) {
    next(error);
  }
};

// ===================== ADMIN ANALYTICS ===================== //

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalContests = await Contest.countDocuments();
    
    // Platform Growth (Registrations per day for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowthRaw = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const submissionGrowthRaw = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Problem Acceptance Rates (Top 5 hardest and easiest based on submission counts)
    const problemStats = await Submission.aggregate([
      { 
        $group: {
          _id: "$problemId",
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } }
        }
      },
      {
        $project: {
          acceptanceRate: { $multiply: [{ $divide: ["$acceptedSubmissions", "$totalSubmissions"] }, 100] },
          totalSubmissions: 1
        }
      }
    ]);

    await Problem.populate(problemStats, { path: '_id', select: 'title difficulty' });
    
    // Filter out null populated problems
    const validStats = problemStats.filter(p => p._id);
    
    const easiestProblems = [...validStats].sort((a, b) => b.acceptanceRate - a.acceptanceRate).slice(0, 5);
    const hardestProblems = [...validStats].sort((a, b) => a.acceptanceRate - b.acceptanceRate).slice(0, 5);

    res.json({
      overview: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests
      },
      growth: {
        users: userGrowthRaw,
        submissions: submissionGrowthRaw
      },
      problemStats: {
        easiest: easiestProblems,
        hardest: hardestProblems
      }
    });
  } catch (error) {
    next(error);
  }
};
