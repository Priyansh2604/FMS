const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

function requireSupabase(res) {
  if (!supabase) {
    res.status(503).json({ error: 'Supabase is not configured' });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id is required' });
  if (!requireSupabase(res)) return;
  const { data, error } = await supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Failed to load investments', details: error.message });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  const { user_id: userId, name, type, quantity, invested_amount: investedAmount, current_value: currentValue, purchase_date: purchaseDate, notes } = req.body;
  if (!userId || !name || !type || investedAmount == null || currentValue == null || !purchaseDate) {
    return res.status(400).json({ error: 'user_id, name, type, invested_amount, current_value, and purchase_date are required' });
  }
  if (!requireSupabase(res)) return;
  const { data, error } = await supabase.from('investments').insert({
    user_id: userId, name: name.trim(), type,
    quantity: quantity == null ? 1 : Number(quantity),
    invested_amount: Number(investedAmount), current_value: Number(currentValue),
    purchase_date: purchaseDate, notes: notes || null,
  }).select().single();
  if (error) return res.status(400).json({ error: 'Failed to create investment', details: error.message });
  res.status(201).json(data);
});

router.delete('/:id', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id is required' });
  if (!requireSupabase(res)) return;
  const { error } = await supabase.from('investments').delete().eq('id', req.params.id).eq('user_id', userId);
  if (error) return res.status(400).json({ error: 'Failed to delete investment', details: error.message });
  res.json({ success: true });
});

module.exports = router;