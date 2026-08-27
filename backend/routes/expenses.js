const express = require('express');
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const { supabase } = require('../supabase');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function tryFastAPI(fn) {
  try {
    return await fn();
  } catch (err) {
    return null;
  }
}

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

router.post('/manual', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }

    const response = await fetch(`${FASTAPI_URL}/api/expenses/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, user_id: userId }),
      timeout: 10000,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[EXPENSES] Manual create error:', err.message);
    res.status(502).json({ success: false, error: { code: 'FASTAPI_UNREACHABLE', message: 'AI service is unavailable' } });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }

    const fastResult = await tryFastAPI(async () => {
      const response = await fetch(`${FASTAPI_URL}/api/expenses/summary?user_id=${encodeURIComponent(userId)}`, { timeout: 10000 });
      if (!response.ok) throw new Error('FastAPI responded with ' + response.status);
      return await response.json();
    });

    if (fastResult) return res.json(fastResult);

    if (!supabase) {
      return res.status(503).json({ success: false, error: { code: 'NO_BACKEND', message: 'Neither AI service nor database available' } });
    }

    const { data: expenses, error } = await supabase
      .from('expenses').select('*').eq('user_id', userId);
    if (error) throw error;

    const totalSpent = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    const byCategory = {};
    (expenses || []).forEach(e => {
      const cat = e.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount || 0);
    });

    res.json({ totalSpent, count: expenses?.length || 0, byCategory, expenses: expenses || [] });
  } catch (err) {
    console.error('[EXPENSES] Summary error:', err.message);
    res.status(500).json({ success: false, error: { code: 'SUMMARY_FAILED', message: err.message } });
  }
});

router.delete('/:expense_id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }

    const fastResult = await tryFastAPI(async () => {
      const response = await fetch(
        `${FASTAPI_URL}/api/expenses/${req.params.expense_id}?user_id=${encodeURIComponent(userId)}`,
        { method: 'DELETE', timeout: 10000 }
      );
      if (!response.ok) throw new Error('FastAPI responded with ' + response.status);
      return await response.json();
    });

    if (fastResult) return res.json(fastResult);

    if (!supabase) {
      return res.status(503).json({ success: false, error: { code: 'NO_BACKEND', message: 'Neither AI service nor database available' } });
    }

    const { error } = await supabase.from('expenses').delete().eq('id', req.params.expense_id).eq('user_id', userId);
    if (error) throw error;
    res.json({ success: true, deletedId: req.params.expense_id });
  } catch (err) {
    console.error('[EXPENSES] Delete error:', err.message);
    res.status(500).json({ success: false, error: { code: 'DELETE_FAILED', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_USER', message: 'user_id is required' } });
    }

    const fastResult = await tryFastAPI(async () => {
      const params = new URLSearchParams({
        user_id: userId,
        page: req.query.page || '1',
        limit: req.query.limit || '20',
      });
      if (req.query.category) params.append('category', req.query.category);
      const response = await fetch(`${FASTAPI_URL}/api/expenses?${params.toString()}`);
      if (!response.ok) throw new Error('FastAPI responded with ' + response.status);
      return await response.json();
    });

    if (fastResult) return res.json(fastResult);

    if (!supabase) {
      return res.status(503).json({ success: false, error: { code: 'NO_BACKEND', message: 'Neither AI service nor database available' } });
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('expenses').select('*', { count: 'exact' }).eq('user_id', userId);
    if (req.query.category) query = query.eq('category', req.query.category);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    res.json({ expenses: data || [], total: count || 0, page, limit });
  } catch (err) {
    console.error('[EXPENSES] List error:', err.message);
    res.status(500).json({ success: false, error: { code: 'LIST_FAILED', message: err.message } });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const fastResult = await tryFastAPI(async () => {
      const response = await fetch(`${FASTAPI_URL}/api/expenses/categories`);
      if (!response.ok) throw new Error('FastAPI responded with ' + response.status);
      return await response.json();
    });
    if (fastResult) return res.json(fastResult);

    const { VALID_CATEGORIES } = require('../utils/categories');
    res.json({
      success: true,
      static: VALID_CATEGORIES,
      learned: [],
      categories: VALID_CATEGORIES.map((c) => ({ value: c, label: c, subcategories: [] })),
      custom_subcategories: [],
    });
  } catch (err) {
    console.error('[EXPENSES] Categories error:', err.message);
    res.status(500).json({ success: false, error: { code: 'CATEGORIES_FAILED', message: err.message } });
  }
});

module.exports = router;
