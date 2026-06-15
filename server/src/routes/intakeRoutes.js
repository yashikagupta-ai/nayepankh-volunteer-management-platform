const express = require('express');
const router = express.Router();
const {
  getIntakeSession,
  handleIntakeChat,
  resetIntakeSession,
  getIntakeRecommendations,
} = require('../controllers/intakeController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all intake agent routes
router.use(protect);

router.get('/', getIntakeSession);
router.post('/chat', handleIntakeChat);
router.post('/reset', resetIntakeSession);
router.get('/recommendations', getIntakeRecommendations);

module.exports = router;
