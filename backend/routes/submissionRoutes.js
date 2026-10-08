const express = require('express');
const { submitCode, getSubmissionsHistory, getProblemSubmissions, getSubmissionById, getSolvedProblems, runCode } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.post('/submit', submitCode);
router.post('/run', runCode);
router.get('/history', getSubmissionsHistory);
router.get('/solved', getSolvedProblems);
router.get('/problem/:problemId', getProblemSubmissions);
router.get('/:id', getSubmissionById);

module.exports = router;
