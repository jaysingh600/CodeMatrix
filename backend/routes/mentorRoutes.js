const express = require('express');
const { getHistory, sendMessage, clearHistory } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting: Free users get 30 mentor messages/day
const mentorLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: async (req, res) => {
    if (req.user && req.user.role === 'ADMIN') return 0; // Unlimited for ADMIN
    return 30; // Limit to 30 for standard users
  },
  message: { message: 'Daily AI mentor limit reached. Upgrade to premium for unlimited chatting.' },
  keyGenerator: (req) => {
    return req.user.id;
  }
});

router.use(protect);

router.get('/history/:problemId', getHistory);
router.post('/chat', mentorLimiter, sendMessage);
router.delete('/history/:problemId', clearHistory);

module.exports = router;
