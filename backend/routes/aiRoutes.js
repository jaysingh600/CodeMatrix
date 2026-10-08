const express = require('express');
const { getHint, explainVisualizerStep, aiNoteAction } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting: Free users get 20 hints/day
const hintLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: async (req, res) => {
    // Ideally we would fetch user role here if it's attached to req.user by protect middleware
    // If Admin/Premium, return 0 (unlimited), else 20.
    if (req.user && req.user.role === 'ADMIN') return 0; // Unlimited for ADMIN
    return 20; // Limit to 20 for standard users
  },
  message: { message: 'Daily AI limit reached. Upgrade to premium for unlimited access.' },
  keyGenerator: (req) => {
    return req.user.id;
  }
});

router.use(protect);

router.post('/hint', hintLimiter, getHint);
router.post('/visualizer-explain', hintLimiter, explainVisualizerStep);
router.post('/notes/action', hintLimiter, aiNoteAction);

module.exports = router;
