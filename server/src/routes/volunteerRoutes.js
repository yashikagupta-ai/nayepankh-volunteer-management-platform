const express = require('express');
const router = express.Router();
const {
  registerVolunteer,
  getAllVolunteers,
  getMyVolunteer,
  getVolunteerById,
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/volunteers      — Register as a volunteer (must be logged in)
router.post('/', protect, registerVolunteer);

// GET  /api/volunteers      — Backward compat, gets own volunteer record
router.get('/', protect, getAllVolunteers);

// GET  /api/volunteers/me   — Get current user's own volunteer record
router.get('/me', protect, getMyVolunteer);

// GET  /api/volunteers/:id  — Get single volunteer (own record only)
router.get('/:id', protect, getVolunteerById);

module.exports = router;
