const express = require('express');
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function getUserId(req) {
  return req.query.user_id || req.body?.user_id || '';
}

router.post('/process', upload.single('file'), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FILE', message: 'No file uploaded' } });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    form.append('user_id', userId);

    const response = await fetch(`${FASTAPI_URL}/api/expenses/process?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      timeout: 120000,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[EXPENSES] Process error:', err.message);
    res.status(502).json({ success: false, error: { code: 'FASTAPI_UNREACHABLE', message: 'AI service is unavailable' } });
  }
});

router.post('/process-batch', upload.array('files', 10), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FILES', message: 'No files uploaded' } });
    }

    const form = new FormData();
    req.files.forEach((f) => {
      form.append('files', f.buffer, { filename: f.originalname, contentType: f.mimetype });
    });
    form.append('user_id', userId);

    const response = await fetch(`${FASTAPI_URL}/api/expenses/process-batch?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      timeout: 300000,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[EXPENSES] Batch error:', err.message);
    res.status(502).json({ success: false, error: { code: 'FASTAPI_UNREACHABLE', message: 'AI service is unavailable' } });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }

    const params = new URLSearchParams({
      user_id: userId,
      page: req.query.page || '1',
      limit: req.query.limit || '20',
    });
    if (req.query.category) params.append('category', req.query.category);

    const response = await fetch(`${FASTAPI_URL}/api/expenses?${params.toString()}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[EXPENSES] List error:', err.message);
    res.status(502).json({ success: false, error: { code: 'FASTAPI_UNREACHABLE', message: 'AI service is unavailable' } });
  }
});

module.exports = router;
