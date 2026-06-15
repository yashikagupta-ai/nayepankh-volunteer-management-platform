const mongoose = require('mongoose');

const intakeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Only one active intake session per user
    },
    currentStep: {
      type: Number,
      default: 1, // Steps: 1 (Name), 2 (Education), 3 (Skills), 4 (Interests), 5 (Recommendations), 6 (Summary)
    },
    profile: {
      name: { type: String, default: '' },
      education: { type: String, default: '' },
      skills: { type: [String], default: [] },
      interests: { type: [String], default: [] },
    },
    recommendations: [
      {
        programName: { type: String, required: true },
        description: { type: String, required: true },
        suitabilityScore: { type: Number, required: true },
        whyRecommended: { type: String, required: true },
      },
    ],
    summary: {
      type: String,
      default: '',
    },
    chatHistory: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const IntakeSession = mongoose.model('IntakeSession', intakeSessionSchema);
module.exports = IntakeSession;
