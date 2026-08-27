const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { supabase } = require('../supabase');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

router.post('/', async (req, res) => {
  try {
    const { messages, user_id } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await fetch(`${FASTAPI_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, user_id: user_id || null }),
      timeout: 60000,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[CHAT] Error:', err.message);
    res.status(502).json({ error: 'AI service is unavailable', details: err.message });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const userId = req.query.user_id || null;
    const url = userId
      ? `${FASTAPI_URL}/api/chat/suggestions?user_id=${encodeURIComponent(userId)}`
      : `${FASTAPI_URL}/api/chat/suggestions`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[CHAT] Suggestions error:', err.message);
    res.status(502).json({
      suggestions: [
        "What's the market outlook today?",
        "Should I prepay my home loan?",
        "How to build an emergency fund?",
        "Health vs term insurance — which first?",
        "Best SIP for ₹5,000 monthly?",
        "How to cut monthly expenses?",
      ],
    });
  }
});

module.exports = router;
