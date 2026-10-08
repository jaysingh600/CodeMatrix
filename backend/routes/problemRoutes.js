const express = require('express');
const { getProblems, getProblemById, getProblemBySlug, getProblemExamples } = require('../controllers/problemController');
const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.get('/slug/:slug', getProblemBySlug);
router.get('/:id/examples', getProblemExamples);

module.exports = router;
