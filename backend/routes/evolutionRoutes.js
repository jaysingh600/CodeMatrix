const express = require('express');
const router = express.Router();
const {
  getProblemVersions,
  getVersionById,
  createCheckpoint,
  restoreVersion,
  updateVersionNote,
  deleteVersion
} = require('../controllers/evolutionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:problemId', getProblemVersions);
router.get('/version/:versionId', getVersionById);
router.post('/checkpoint', createCheckpoint);
router.post('/restore/:versionId', restoreVersion);
router.put('/version/:versionId', updateVersionNote);
router.delete('/version/:versionId', deleteVersion);

module.exports = router;
