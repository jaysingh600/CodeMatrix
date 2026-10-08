const Problem = require('../models/Problem');
const User = require('../models/User');
const TestCase = require('../models/TestCase');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ streak: { $gt: 0 } });
    const totalQuestions = await Problem.countDocuments();
    
    // Some mock data for the rest since we don't have submissions/live rooms fully modeled yet
    const totalSubmissions = 15420;
    const acceptedSubmissions = 9850;
    const aiHintsToday = 450;
    const aiMentorConvos = 120;
    const liveChatRooms = 15;
    const runningContests = 2;

    // Mock Chart Data
    const registrations = [
      { name: 'Mon', count: 45 },
      { name: 'Tue', count: 52 },
      { name: 'Wed', count: 38 },
      { name: 'Thu', count: 65 },
      { name: 'Fri', count: 48 },
      { name: 'Sat', count: 85 },
      { name: 'Sun', count: 92 },
    ];

    const difficultyDistribution = [
      { name: 'Easy', value: await Problem.countDocuments({ difficulty: 'Easy' }) },
      { name: 'Medium', value: await Problem.countDocuments({ difficulty: 'Medium' }) },
      { name: 'Hard', value: await Problem.countDocuments({ difficulty: 'Hard' }) },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalQuestions,
          totalSubmissions,
          acceptedSubmissions,
          aiHintsToday,
          aiMentorConvos,
          liveChatRooms,
          runningContests
        },
        charts: {
          registrations,
          difficultyDistribution
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all questions (Admin)
// @route   GET /api/admin/questions
// @access  Private/Admin
exports.getQuestions = async (req, res, next) => {
  try {
    const { search, difficulty, topic, status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = { $in: [topic] };
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Problem.countDocuments(query);
    const questions = await Problem.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single question
// @route   GET /api/admin/questions/:id
// @access  Private/Admin
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Problem.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Create question
// @route   POST /api/admin/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    // Auto-update isPublished based on status
    if (req.body.status === 'Published') {
      req.body.isPublished = true;
    } else {
      req.body.isPublished = false;
    }

    const question = await Problem.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    req.body.updatedBy = req.user.id;
    
    if (req.body.status) {
      req.body.isPublished = req.body.status === 'Published';
    }

    const question = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Problem.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Duplicate question
// @route   POST /api/admin/questions/:id/duplicate
// @access  Private/Admin
exports.duplicateQuestion = async (req, res, next) => {
  try {
    const original = await Problem.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.slug = `${duplicateData.slug}-copy-${Date.now()}`;
    duplicateData.status = 'Draft';
    duplicateData.isPublished = false;
    duplicateData.createdBy = req.user.id;
    
    const duplicate = await Problem.create(duplicateData);
    res.status(201).json({ success: true, data: duplicate });
  } catch (err) {
    next(err);
  }
};

// @desc    Publish question
// @route   PATCH /api/admin/questions/:id/publish
// @access  Private/Admin
exports.publishQuestion = async (req, res, next) => {
  try {
    const question = await Problem.findByIdAndUpdate(
      req.params.id,
      { status: 'Published', isPublished: true, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Archive question
// @route   PATCH /api/admin/questions/:id/archive
// @access  Private/Admin
exports.archiveQuestion = async (req, res, next) => {
  try {
    const question = await Problem.findByIdAndUpdate(
      req.params.id,
      { status: 'Archived', isPublished: false, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// @desc    Get test cases for a question
// @route   GET /api/admin/questions/:id/testcases
// @access  Private/Admin
exports.getTestCases = async (req, res, next) => {
  try {
    const testCases = await TestCase.find({ problemId: req.params.id }).sort({ order: 1 });
    res.status(200).json({ success: true, data: testCases });
  } catch (err) {
    next(err);
  }
};

// @desc    Create test case
// @route   POST /api/admin/questions/:id/testcases
// @access  Private/Admin
exports.createTestCase = async (req, res, next) => {
  try {
    req.body.problemId = req.params.id;
    const testCase = await TestCase.create(req.body);
    res.status(201).json({ success: true, data: testCase });
  } catch (err) {
    next(err);
  }
};

// @desc    Update test case
// @route   PUT /api/admin/testcases/:id
// @access  Private/Admin
exports.updateTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }
    res.status(200).json({ success: true, data: testCase });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete test case
// @route   DELETE /api/admin/testcases/:id
// @access  Private/Admin
exports.deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.id);
    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder test cases
// @route   PATCH /api/admin/questions/:id/testcases/reorder
// @access  Private/Admin
exports.reorderTestCases = async (req, res, next) => {
  try {
    const { testCases } = req.body;
    for (let i = 0; i < testCases.length; i++) {
      await TestCase.findByIdAndUpdate(testCases[i], { order: i });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import test cases
// @route   POST /api/admin/questions/:id/testcases/bulk
// @access  Private/Admin
exports.bulkImportTestCases = async (req, res, next) => {
  try {
    const { rawData, isHidden } = req.body;
    
    // Simple parser: split by 'Input:' and 'Output:'
    // Format expected:
    // Input:\n...\nOutput:\n...\n---
    const blocks = rawData.split('---').map(b => b.trim()).filter(b => b);
    const newTestCases = [];

    // Get current max order
    const existingCases = await TestCase.find({ problemId: req.params.id }).sort({ order: -1 }).limit(1);
    let orderStart = existingCases.length > 0 ? existingCases[0].order + 1 : 1;

    for (const block of blocks) {
      const inputMatch = block.match(/Input:([\s\S]*?)Output:/i);
      const outputMatch = block.match(/Output:([\s\S]*)/i);
      
      if (inputMatch && outputMatch) {
        newTestCases.push({
          problemId: req.params.id,
          input: inputMatch[1].trim(),
          expectedOutput: outputMatch[1].trim(),
          isHidden: isHidden !== undefined ? isHidden : true,
          order: orderStart++
        });
      }
    }

    const created = await TestCase.insertMany(newTestCases);
    res.status(201).json({ success: true, data: created, imported: created.length });
  } catch (err) {
    next(err);
  }
};

const Contest = require('../models/Contest');

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query = {
        $or: [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      };
    }
    if (req.query.role) {
      query.role = req.query.role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password') // exclude password
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contests for admin
// @route   GET /api/admin/contests
// @access  Private/Admin
exports.getContests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Contest.countDocuments(query);
    const contests = await Contest.find(query)
      .populate('host', 'username email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: contests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all test cases for admin (Global view, grouped by problem)
// @route   GET /api/admin/testcases
// @access  Private/Admin
exports.getGlobalTestCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let matchQuery = {};
    if (req.query.search) {
      matchQuery.title = { $regex: req.query.search, $options: 'i' };
    }

    // We'll return problems and their testcase count.
    const problems = await Problem.find(matchQuery)
      .select('title slug difficulty')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Problem.countDocuments(matchQuery);

    // Fetch counts for these specific problems
    const problemIds = problems.map(p => p._id);
    const counts = await TestCase.aggregate([
      { $match: { problemId: { $in: problemIds } } },
      { $group: { _id: '$problemId', count: { $sum: 1 } } }
    ]);

    const data = problems.map(p => {
      const c = counts.find(c => c._id.toString() === p._id.toString());
      return {
        _id: p._id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        testCaseCount: c ? c.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

