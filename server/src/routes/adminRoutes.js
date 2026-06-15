const express = require('express');
const router = express.Router();
const {
  getAllVolunteers,
  getStats,
  deleteVolunteer,
  updateVolunteerStatus,
  getAllUsers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Apply protection to all admin routes
router.use(protect);
router.use(adminOnly);

// Route mappings
router.get('/volunteers', getAllVolunteers);
router.get('/stats', getStats);
router.delete('/volunteers/:id', deleteVolunteer);
router.patch('/volunteers/:id/status', updateVolunteerStatus);
router.get('/users', getAllUsers);

module.exports = router;
