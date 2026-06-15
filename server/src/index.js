require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const volunteerRoutes = require('./routes/volunteerRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const intakeRoutes = require('./routes/intakeRoutes');

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🌟 NayePankh Foundation API is running!',
    version: '2.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)',
      },
      volunteers: {
        create: 'POST /api/volunteers (protected)',
        list: 'GET /api/volunteers (protected)',
        single: 'GET /api/volunteers/:id (protected)',
      },
    },
  });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Volunteer routes (protected inside route file)
app.use('/api/volunteers', volunteerRoutes);

// Admin routes (protected inside route file)
app.use('/api/admin', adminRoutes);

// AI Chatbot routes (public)
app.use('/api/chat', chatRoutes);

// AI Intake Agent routes (protected)
app.use('/api/intake', intakeRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Auth: enabled`);
});
