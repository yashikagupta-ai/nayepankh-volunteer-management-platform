const Volunteer = require('../models/Volunteer');

// @desc    Register a new volunteer (links to logged-in user)
// @route   POST /api/volunteers
// @access  Private
const registerVolunteer = async (req, res) => {
  try {
    const { fullName, email, phone, city, skills, interests, availability } = req.body;

    // Check if this user already submitted a volunteer form
    const alreadyRegistered = await Volunteer.findOne({ createdBy: req.user._id });
    if (alreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: 'You have already registered as a volunteer.',
        data: alreadyRegistered,
      });
    }

    // Check if email is already used by another volunteer
    const emailTaken = await Volunteer.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'A volunteer with this email address is already registered.',
      });
    }

    const volunteer = await Volunteer.create({
      fullName,
      email,
      phone,
      city,
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      availability,
      createdBy: req.user._id,   // ← link to user account
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer registered successfully! Welcome to the NayePankh family 🎉',
      data: volunteer,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages[0] || 'Validation failed' });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A volunteer with this email address is already registered.' });
    }
    console.error('Register volunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Get the current user's own volunteer registration
// @route   GET /api/volunteers/me
// @access  Private (regular users only see their OWN record)
const getMyVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ createdBy: req.user._id }).select('-__v');
    res.status(200).json({
      success: true,
      data: volunteer || null,   // null means user hasn't registered yet
    });
  } catch (error) {
    console.error('Get my volunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// kept for backward compat — now scoped to logged-in user only
const getAllVolunteers = getMyVolunteer;

// @desc    Get a single volunteer by ID (own record only)
// @route   GET /api/volunteers/:id
// @access  Private
const getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).select('-__v');

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    console.error('Get volunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = { registerVolunteer, getAllVolunteers, getMyVolunteer, getVolunteerById };
