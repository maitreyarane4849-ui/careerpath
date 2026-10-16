const express = require('express');
const { objectIdParam } = require('../middleware/validateParams');
const { getCareers, getCareerById } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCareers);
router.get('/:id', protect, getCareerById);
router.param('id', objectIdParam);

module.exports = router;