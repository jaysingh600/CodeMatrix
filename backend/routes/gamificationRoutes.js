const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
  getMyAchievements,
  getLeaderboard
} = require('../controllers/gamificationController');

router.use(protect);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllRead);

router.get('/achievements', getMyAchievements);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
