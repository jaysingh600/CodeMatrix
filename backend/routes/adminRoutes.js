const express = require('express');
const {
  getDashboardStats,
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  publishQuestion,
  archiveQuestion,
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  reorderTestCases,
  bulkImportTestCases,
  getUsers,
  getContests,
  getGlobalTestCases
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth & admin middleware to all routes in this router
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard route
router.get('/dashboard', getDashboardStats);

// Users management routes
router.get('/users', getUsers);

// Contests management routes
router.get('/contests', getContests);

// Global Test Cases route
router.get('/testcases', getGlobalTestCases);

// Questions management routes
router.route('/questions')
  .get(getQuestions)
  .post(createQuestion);

router.route('/questions/:id')
  .get(getQuestion)
  .put(updateQuestion)
  .delete(deleteQuestion);

router.post('/questions/:id/duplicate', duplicateQuestion);
router.patch('/questions/:id/publish', publishQuestion);
router.patch('/questions/:id/archive', archiveQuestion);

// Test cases management routes
router.route('/questions/:id/testcases')
  .get(getTestCases)
  .post(createTestCase);

router.post('/questions/:id/testcases/bulk', bulkImportTestCases);
router.patch('/questions/:id/testcases/reorder', reorderTestCases);

router.route('/testcases/:id')
  .put(updateTestCase)
  .delete(deleteTestCase);

module.exports = router;
