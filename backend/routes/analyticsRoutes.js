const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUserAnalytics,
  getUserHeatmap,
  getAdminAnalytics
} = require('../controllers/analyticsController');

// User routes
router.get('/user', protect, getUserAnalytics);
router.get('/user/heatmap', protect, getUserHeatmap);

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), getAdminAnalytics);

module.exports = router;
