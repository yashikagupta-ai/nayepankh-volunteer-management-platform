const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all volunteers with search, filter, pagination
// @route   GET /api/admin/volunteers
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
const getAllVolunteers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      city = '',
      availability = '',
      status = '',
      skill = '',
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Full-text style search on name, email, city
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) query.city = { $regex: city, $options: 'i' };
    if (availability) query.availability = availability;
    if (status) query.status = status;
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };

    const total = await Volunteer.countDocuments(query);

    const volunteers = await Volunteer.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Admin get volunteers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get volunteer statistics
// @route   GET /api/admin/stats
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVolunteers,
      activeVolunteers,
      pendingVolunteers,
      newThisWeek,
      newThisMonth,
      totalUsers,
      cityDistribution,
      topSkills,
      topInterests,
      availabilityDistribution,
      weeklyRegistrations,
    ] = await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'approved' }),
      Volunteer.countDocuments({ status: 'pending' }),
      Volunteer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Volunteer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments(),

      // Top 5 cities
      Volunteer.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Top 8 skills
      Volunteer.aggregate([
        { $unwind: '$skills' },
        { $match: { skills: { $ne: '' } } },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Top 5 interests
      Volunteer.aggregate([
        { $unwind: '$interests' },
        { $match: { interests: { $ne: '' } } },
        { $group: { _id: '$interests', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Availability breakdown
      Volunteer.aggregate([
        { $group: { _id: '$availability', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Last 7 days registrations per day
      Volunteer.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVolunteers,
        activeVolunteers,
        pendingVolunteers,
        newThisWeek,
        newThisMonth,
        totalUsers,
        cityDistribution,
        topSkills,
        topInterests,
        availabilityDistribution,
        weeklyRegistrations,
      },
    });
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a volunteer
// @route   DELETE /api/admin/volunteers/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    res.status(200).json({ success: true, message: 'Volunteer deleted successfully.' });
  } catch (error) {
    console.error('Admin delete volunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update volunteer status (approve / reject)
// @route   PATCH /api/admin/volunteers/:id/status
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
const updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: false }
    );
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    res.status(200).json({ success: true, message: `Volunteer status updated to "${status}".`, data: volunteer });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all registered user accounts
// @route   GET /api/admin/users
// @access  Admin only
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getAllVolunteers,
  getStats,
  deleteVolunteer,
  updateVolunteerStatus,
  getAllUsers,
};
