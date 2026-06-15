const axios = require('axios');
const IntakeSession = require('../models/IntakeSession');

const NAYEPANKH_INTAKE_INSTRUCTION = `
You are "Pankh", the NayePankh Volunteer Intake Agent. Your goal is to guide a prospective volunteer through a structured 6-step intake process.

You must converse naturally, ask follow-up questions if details are unclear, and return your response in a strict JSON format so the system can save the volunteer's profile fields in real-time.

STRUCTURED WORKFLOW STEPS:
- Step 1 (Welcome & Name): Welcome the user warmly and extract their full name.
- Step 2 (Education): Ask for and extract their educational background (e.g. current student, degree, major, school/college).
- Step 3 (Skills): Ask for and extract their skills/expertise (e.g. teaching, communication, coding, graphic design, social media, event planning).
- Step 4 (Interests): Ask for and extract their areas of interest / causes they want to support (e.g. child education, women's hygiene, feeding stray animals, raising funds, digital marketing).
- Step 5 (Recommendations): Based on their Education, Skills, and Interests, evaluate and recommend matching NayePankh programs. Offer them 2 to 3 tailored choices from the program list below, explaining why they match.
- Step 6 (Summary): Present a professional, encouraging volunteer profile summary compiling everything gathered. Congratulate them and complete the session.

AVAILABLE NAYEPANKH PROGRAMS FOR RECOMMENDATIONS (Step 5):
1. "NayePankh Volunteer Teaching Program": Ideal for users with interests in child education/mentorship, or skills like teaching/communication.
2. "Sanitary Pads Distribution & Women Hygiene Campaign": Ideal for users interested in women empowerment, hygiene, or community social drives.
3. "Stray Animals Feeding & Welfare Drive": Ideal for animal lovers or users interested in animal rescue.
4. "Digital Outreach & Community Influencer Internship": Remote. Ideal for skills like social media, content writing, design, graphic design, marketing.
5. "Fundraising & Social Advocacy Internship": Remote. Ideal for skills like communication, leadership, sales, persuasion, business.

JSON RESPONSE FORMAT:
For EVERY turn, you MUST return a raw JSON object matching the following structure. Do not output normal markdown outside the JSON object.

\`\`\`json
{
  "extractedInfo": {
    "name": "Full name if extracted in this turn or previous turns, otherwise empty string",
    "education": "Education details if extracted in this turn or previous turns, otherwise empty string",
    "skills": ["Array of skills if extracted, otherwise empty array"],
    "interests": ["Array of interests if extracted, otherwise empty array"]
  },
  "nextStep": 1 | 2 | 3 | 4 | 5 | 6,
  "agentMessage": "Your natural language conversational response to the user. Keep it warm, engaging, and clear.",
  "recommendations": [
    {
      "programName": "Exact name of program",
      "description": "Brief description of what they will do",
      "suitabilityScore": 1 to 100,
      "whyRecommended": "1 sentence matching their education/skills/interests"
    }
  ],
  "summary": "A 3-4 sentence professional summary of the volunteer (only output when transitioning to Step 6, otherwise empty string)"
}
\`\`\`

CURRENT CONTEXT:
`;

// @desc    Get or create active intake session for user
// @route   GET /api/intake
// @access  Private
const getIntakeSession = async (req, res) => {
  try {
    let session = await IntakeSession.findOne({ userId: req.user._id }).select('-__v');

    if (!session) {
      // Create a default initial session
      session = await IntakeSession.create({
        userId: req.user._id,
        currentStep: 1,
        chatHistory: [
          {
            role: 'model',
            text: `Hello! I am Pankh 🪶, your NayePankh Volunteer Intake Agent. I am here to help you find the best way to volunteer with us. To get started, could you please tell me your full name?`,
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get intake session error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Send chat message to intake agent
// @route   POST /api/intake/chat
// @access  Private
const handleIntakeChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured in backend environment.',
      });
    }

    // Find user's active session
    let session = await IntakeSession.findOne({ userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not initialized. Please fetch session first.' });
    }

    // Prepare context payload for Gemini
    const currentContext = `
- Current Step: ${session.currentStep}
- Profile Saved State:
  - Name: "${session.profile.name}"
  - Education: "${session.profile.education}"
  - Skills: ${JSON.stringify(session.profile.skills)}
  - Interests: ${JSON.stringify(session.profile.interests)}
`;

    // Map conversation history
    const contents = session.chatHistory.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(
      geminiUrl,
      {
        contents,
        systemInstruction: {
          parts: [{ text: NAYEPANKH_INTAKE_INSTRUCTION + currentContext }],
        },
        generationConfig: {
          temperature: 0.5,
          responseMimeType: 'application/json',
          maxOutputTokens: 1000,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Invalid response structure received from Gemini API.');
    }

    // Parse structured JSON response
    let cleanJson = reply.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const aiResult = JSON.parse(cleanJson);

    // ── Update Session State in DB ──────────────────────────────────────────
    
    // 1. Update Profile Fields if extracted
    if (aiResult.extractedInfo?.name) {
      session.profile.name = aiResult.extractedInfo.name;
    }
    if (aiResult.extractedInfo?.education) {
      session.profile.education = aiResult.extractedInfo.education;
    }
    if (Array.isArray(aiResult.extractedInfo?.skills) && aiResult.extractedInfo.skills.length > 0) {
      // Merge unique skills
      session.profile.skills = [...new Set([...session.profile.skills, ...aiResult.extractedInfo.skills])];
    }
    if (Array.isArray(aiResult.extractedInfo?.interests) && aiResult.extractedInfo.interests.length > 0) {
      // Merge unique interests
      session.profile.interests = [...new Set([...session.profile.interests, ...aiResult.extractedInfo.interests])];
    }

    // 2. Recommendations & Summary
    if (Array.isArray(aiResult.recommendations) && aiResult.recommendations.length > 0) {
      session.recommendations = aiResult.recommendations;
    }
    if (aiResult.summary) {
      session.summary = aiResult.summary;
    }

    // 3. Step advancement
    if (aiResult.nextStep) {
      session.currentStep = Number(aiResult.nextStep);
      if (session.currentStep === 6) {
        session.isCompleted = true;
      }
    }

    // 4. Update History
    session.chatHistory.push({ role: 'user', text: message });
    session.chatHistory.push({ role: 'model', text: aiResult.agentMessage });

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      reply: aiResult.agentMessage,
    });
  } catch (error) {
    console.error('Intake Chat Error:', error.response?.data || error.message);
    const errMsg = error.response?.data?.error?.message || error.message || 'Error processing response.';
    res.status(500).json({
      success: false,
      message: `Failed to process message: ${errMsg}`,
    });
  }
};

// @desc    Reset intake session (delete and recreate)
// @route   POST /api/intake/reset
// @access  Private
const resetIntakeSession = async (req, res) => {
  try {
    await IntakeSession.findOneAndDelete({ userId: req.user._id });

    // Create a new fresh session
    const session = await IntakeSession.create({
      userId: req.user._id,
      currentStep: 1,
      chatHistory: [
        {
          role: 'model',
          text: `Hello! I am Pankh 🪶, your NayePankh Volunteer Intake Agent. I am here to help you find the best way to volunteer with us. To get started, could you please tell me your full name?`,
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: session,
      message: 'Intake session reset successfully.',
    });
  } catch (error) {
    console.error('Reset intake session error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get intake session recommendations
// @route   GET /api/intake/recommendations
// @access  Private
const getIntakeRecommendations = async (req, res) => {
  try {
    const session = await IntakeSession.findOne({ userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    res.status(200).json({
      success: true,
      recommendations: session.recommendations,
      summary: session.summary,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getIntakeSession,
  handleIntakeChat,
  resetIntakeSession,
  getIntakeRecommendations,
};
