const express = require('express');
const {
  getProfile,
  saveProfile,
  addInterests,
  deleteProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, saveProfile);
router.patch('/interests', protect, addInterests);
router.delete('/', protect, deleteProfile);

module.exports = router;