const Contest = require('../models/Contest');
const ContestParticipant = require('../models/ContestParticipant');

// ================= ADMIN ACTIONS ================= //

exports.createContest = async (req, res, next) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(contest);
  } catch (error) {
    next(error);
  }
};

exports.updateContest = async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    next(error);
  }
};

exports.deleteContest = async (req, res, next) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    await ContestParticipant.deleteMany({ contestId: req.params.id });
    res.json({ message: 'Contest deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= PUBLIC ACTIONS ================= //

exports.getContests = async (req, res, next) => {
  try {
    // Basic auto-update status based on time (simplistic approach for demo)
    const now = new Date();
    await Contest.updateMany({ startTime: { $lte: now }, endTime: { $gt: now }, status: 'Upcoming' }, { status: 'Running' });
    await Contest.updateMany({ endTime: { $lte: now }, status: 'Running' }, { status: 'Ended' });

    const contests = await Contest.find().sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    next(error);
  }
};

exports.getContestById = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems.problemId', 'title slug difficulty');
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (error) {
    next(error);
  }
};

// ================= USER ACTIONS ================= //

exports.joinContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    let participant = await ContestParticipant.findOne({ contestId: contest._id, userId: req.user.id });
    if (participant) {
      return res.json(participant); // Already joined
    }

    participant = await ContestParticipant.create({
      contestId: contest._id,
      userId: req.user.id,
      problemStats: {}
    });

    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
};

exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const participants = await ContestParticipant.find({ contestId: req.params.id })
      .populate('userId', 'username avatar')
      .sort({ score: -1, penalty: 1 })
      .limit(100); // Top 100
      
    res.json(participants);
  } catch (error) {
    next(error);
  }
};

exports.getUserContestData = async (req, res, next) => {
  try {
    const participant = await ContestParticipant.findOne({ contestId: req.params.id, userId: req.user.id });
    res.json(participant || { notJoined: true });
  } catch (error) {
    next(error);
  }
};

// ================= PRIVATE CONTEST ACTIONS ================= //

exports.createPrivateContest = async (req, res, next) => {
  try {
    const { title, description, duration, numQuestions, difficulty, startTime, endTime } = req.body;
    
    // Generate unique 6 digit code
    let contestCode = Math.floor(100000 + Math.random() * 900000).toString();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Contest.findOne({ contestCode });
      if (!existing) isUnique = true;
      else contestCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Fetch random problems
    const Problem = require('../models/Problem');
    let query = { isPublished: true };
    if (difficulty) query.difficulty = difficulty;
    
    const problems = await Problem.aggregate([
      { $match: query },
      { $sample: { size: numQuestions || 3 } }
    ]);

    const contestProblems = problems.map((p, index) => {
      let points = 100;
      if (p.difficulty === 'Medium') points = 200;
      if (p.difficulty === 'Hard') points = 300;
      return {
        problemId: p._id,
        points,
        order: index + 1
      };
    });

    const contest = await Contest.create({
      title,
      description,
      duration,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + duration * 60000),
      type: 'Private',
      contestCode,
      slug: `private-${contestCode}`,
      status: 'Waiting',
      createdBy: req.user.id,
      problems: contestProblems
    });

    // Add creator as participant automatically
    await ContestParticipant.create({
      contestId: contest._id,
      userId: req.user.id,
      problemStats: {}
    });

    res.status(201).json(contest);
  } catch (error) {
    next(error);
  }
};

exports.joinPrivateContest = async (req, res, next) => {
  try {
    const { contestCode } = req.body;
    if (!contestCode) return res.status(400).json({ message: 'Contest code is required' });

    const contest = await Contest.findOne({ contestCode, type: 'Private' });
    if (!contest) return res.status(404).json({ message: 'Invalid contest code' });

    if (contest.status === 'Running' || contest.status === 'Active' || contest.status === 'Ended' || contest.status === 'Finished') {
      return res.status(400).json({ message: 'Contest has already started or ended.' });
    }

    let participant = await ContestParticipant.findOne({ contestId: contest._id, userId: req.user.id });
    if (participant) {
      return res.status(400).json({ message: 'You have already joined this contest.' });
    }

    participant = await ContestParticipant.create({
      contestId: contest._id,
      userId: req.user.id,
      problemStats: {}
    });
    
    // Notify room via socket
    const io = req.app.get('socketio');
    if (io) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id).select('username avatar');
      io.to(`contest_${contest._id}`).emit('participant-joined', {
        message: `${user.username} joined the contest.`,
        user
      });
    }

    res.status(201).json({ message: 'Successfully joined the contest.', contestId: contest._id });
  } catch (error) {
    next(error);
  }
};

exports.startContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    if (contest.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can start the contest.' });
    }
    
    if (contest.status !== 'Waiting') {
      return res.status(400).json({ message: 'Contest cannot be started' });
    }

    contest.status = 'Active';
    contest.startTime = new Date();
    contest.endTime = new Date(Date.now() + contest.duration * 60000);
    await contest.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(`contest_${contest._id}`).emit('contest-started', {
        message: 'Contest has started!',
        startTime: contest.startTime,
        endTime: contest.endTime
      });
      
      // Auto-end timer
      setTimeout(async () => {
        const checkContest = await Contest.findById(contest._id);
        if (checkContest && checkContest.status === 'Active') {
           checkContest.status = 'Finished';
           await checkContest.save();
           io.to(`contest_${contest._id}`).emit('contest-ended', { message: 'Contest finished' });
        }
      }, contest.duration * 60000);
    }

    res.json({ message: 'Contest started', contest });
  } catch (error) {
    next(error);
  }
};

exports.endContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    if (contest.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can end the contest.' });
    }
    
    contest.status = 'Finished';
    contest.endTime = new Date();
    await contest.save();
    
    const io = req.app.get('socketio');
    if (io) {
      io.to(`contest_${contest._id}`).emit('contest-ended', { message: 'Contest finished by host' });
    }
    
    res.json({ message: 'Contest ended' });
  } catch (error) {
    next(error);
  }
};

exports.getUserContestHistory = async (req, res, next) => {
  try {
    const participants = await ContestParticipant.find({ userId: req.user.id })
      .populate('contestId')
      .sort({ createdAt: -1 });
      
    // Filter valid history and perhaps attach rank
    const history = [];
    for (const p of participants) {
      if (p.contestId) {
        // Find total participants for the contest to get count
        const count = await ContestParticipant.countDocuments({ contestId: p.contestId._id });
        // Calculate rank if finished (naive: find how many have higher score or same score with lower penalty)
        const higherRankCount = await ContestParticipant.countDocuments({
          contestId: p.contestId._id,
          $or: [
            { score: { $gt: p.score } },
            { score: p.score, penalty: { $lt: p.penalty } }
          ]
        });
        
        history.push({
          contest: p.contestId,
          score: p.score,
          penalty: p.penalty,
          rank: higherRankCount + 1,
          totalParticipants: count
        });
      }
    }
    
    res.json(history);
  } catch (error) {
    next(error);
  }
};
