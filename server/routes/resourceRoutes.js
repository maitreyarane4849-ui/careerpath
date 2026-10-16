const express = require('express');
const { recommend } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recommend', protect, recommend);

module.exports = router;