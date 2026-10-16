const express = require('express');
const { objectIdParam } = require('../middleware/validateParams');
const { downloadPdf, emailPdf } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id/pdf', protect, downloadPdf);
router.post('/:id/email', protect, emailPdf);
router.param('id', objectIdParam);

module.exports = router;