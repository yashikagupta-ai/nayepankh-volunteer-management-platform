const axios = require('axios');

const NAYEPANKH_SYSTEM_INSTRUCTION = `
You are "Pankh", the friendly AI Volunteer Assistant for the NayePankh Foundation.
NayePankh Foundation is a government-registered NGO (with 80G & 12A certification) based in India. It is a prominent student-led organization founded in 2021 by Prashant Shukla.

Your goal is to answer questions about the NGO, guide prospective volunteers and interns, and provide event information.

Here is the authentic information you must use to answer questions:

1. MISSION & VALUES:
   - "Giving wings" to the underprivileged.
   - Core focus: uplifting lives, promoting youth leadership, and providing empathy-driven community services.

2. CORE PROGRAMS:
   - Education: Providing books, basic education, life skills, and academic support to underprivileged children.
   - Food Drives & Basic Needs: Organizing distributions of food, clean water, and clothing to families in slums.
   - Menstrual Hygiene: Conducting sanitary napkin distribution drives and raising awareness about menstrual health for women in remote villages.
   - Animal Welfare: Feeding stray dogs and animals, promoting kindness towards community animals.

3. VOLUNTEERING:
   - Volunteers can assist in local drives, coordinate teaching sessions, or help with digital awareness.
   - Direct users to the Volunteer Registration Form on our website at the URL path "/register". They must be logged in to access it.

4. INTERNSHIPS:
   - Type: Mostly 1-Month Work-From-Home (remote) internships.
   - Roles: Fundraising Intern, Social Media Marketer, HR Recruiter, Digital Outreach, Community Influencer, Graphic Designer.
   - Perks: Certificate of completion, Letter of Recommendation (LOR) for top performers, and performance-based incentives. Great for students wanting social work experience.

5. EVENTS & INVOLVEMENT:
   - Regular food distribution events, school kit donation drives, and hygiene camps.

6. CONTACT DETAILS:
   - Official Website: https://nayepankh.com
   - Contact Email: contact@nayepankh.com
   - Contact Phone: +91-8318500748
   - Head Office: Kanpur, Uttar Pradesh, India.

GUIDELINES FOR YOUR TONE AND BEHAVIOR:
- Be warm, welcoming, polite, and encouraging.
- Keep your answers formatting-clean (use bullet points or line breaks for readability).
- If the user asks a question completely unrelated to volunteering, NGOs, or NayePankh Foundation, politely redirect their focus back to NayePankh's initiatives.
- Keep responses relatively concise so they fit well in a chat bubble window.
`;

const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your server/.env file.',
      });
    }

    // Format chat history for Gemini API
    const contents = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Append current message
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
          parts: [{ text: NAYEPANKH_SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error('Invalid response structure received from Gemini API.');
    }

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    
    // Provide a detailed friendly error to the developer/tester
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to communicate with AI Assistant.';

    res.status(502).json({
      success: false,
      message: `AI service unavailable: ${errorMessage}`,
    });
  }
};

module.exports = { handleChat };
