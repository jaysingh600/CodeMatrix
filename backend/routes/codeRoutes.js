const express = require('express');
const { executeCode } = require('../controllers/codeController');
const router = express.Router();

router.post('/run', executeCode);

module.exports = router;
