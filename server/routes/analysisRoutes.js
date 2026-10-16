const express = require('express');
const { objectIdParam } = require('../middleware/validateParams');
const {
  runAnalysis,
  runFull,
  getReports,
  getReportById,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, runAnalysis);
router.param('id', objectIdParam);
router.post('/full', protect, runFull);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);

module.exports = router;