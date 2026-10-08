const express = require('express');
const router = express.Router();
const {
  getPreferences,
  updatePreferences,
  trackAlgorithm
} = require('../controllers/visualizerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/track', trackAlgorithm);

module.exports = router;
