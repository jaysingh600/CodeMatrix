const express = require('express');
const router = express.Router();
const {
  createContest,
  updateContest,
  deleteContest,
  getContests,
  getContestById,
  joinContest,
  getContestLeaderboard,
  getUserContestData,
  createPrivateContest,
  joinPrivateContest,
  getUserContestHistory,
  startContest,
  endContest
} = require('../controllers/contestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.get('/', getContests);
router.get('/:id', getContestById);
router.get('/:id/leaderboard', getContestLeaderboard);

// User Protected
router.use(protect);
router.post('/private', createPrivateContest);
router.post('/join-private', joinPrivateContest);
router.get('/user/history', getUserContestHistory);

router.post('/:id/join', joinContest);
router.get('/:id/me', getUserContestData);
router.post('/:id/start', startContest);
router.post('/:id/end', endContest);

// Admin Protected
router.post('/', authorize('ADMIN'), createContest);
router.put('/:id', authorize('ADMIN'), updateContest);
router.delete('/:id', authorize('ADMIN'), deleteContest);

module.exports = router;
