const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');

// POST /api/chat - Chat with AI assistant
router.post('/', handleChat);

module.exports = router;
