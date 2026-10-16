const express = require('express');
const {
  generate,
  getLatest,
  getById,
  getByReport,
  toggleTask,
  getProgress,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const { objectIdParam } = require('../middleware/validateParams');

const router = express.Router();

router.param('id', objectIdParam);
router.param('taskId', objectIdParam);
router.param('reportId', objectIdParam);

router.post('/generate', protect, generate);
router.get('/', protect, getLatest);
router.get('/by-report/:reportId', protect, getByReport); // must stay above '/:id'
router.get('/:id', protect, getById);
router.get('/:id/progress', protect, getProgress);
router.patch('/:id/tasks/:taskId', protect, toggleTask);

module.exports = router;