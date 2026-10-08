const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

const getProblems = async (req, res) => {
  try {
    const { difficulty, topic, search } = req.query;
    
    let query = {};
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    const problems = await Problem.find(query).select('-description -starterCodeJava -starterCodeCpp -starterCodePython -starterCodeJavaScript -constraints');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProblemExamples = async (req, res) => {
  try {
    const examples = await TestCase.find({ 
      problemId: req.params.id, 
      isHidden: false 
    }).sort({ order: 1 });
    res.json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  getProblemBySlug,
  getProblemExamples
};
