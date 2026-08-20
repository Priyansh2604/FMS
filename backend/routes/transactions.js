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

function isMissingTransactionsTable(error) {
  return error?.code === 'PGRST205' || /could not find the table .*transactions/i.test(error?.message || '');
}

function mapExpenseToTransaction(expense) {
  const isIncome = expense.source === 'manual_income';
  return {
    id: expense.id,
    user_id: expense.user_id,
    merchant: expense.merchant,
    type: isIncome ? 'income' : 'expense',
    category: expense.category,
    amount: Math.abs(Number(expense.amount)),
    date: expense.expense_date,
    notes: expense.description || null,
    created_at: expense.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    if (!requireSupabase(res)) return;
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });

    if (error && isMissingTransactionsTable(error)) {
      const fallback = await supabase.from('expenses').select('*').eq('user_id', userId).in('source', ['manual', 'manual_income']).order('expense_date', { ascending: false });
      if (fallback.error) throw fallback.error;
      return res.json((fallback.data || []).map(mapExpenseToTransaction));
    }
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transactions', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id: userId, merchant, type, category, amount, date, notes } = req.body;
    if (!userId || !merchant || !type || !category || amount == null || !date) {
      return res.status(400).json({ error: 'user_id, merchant, type, category, amount, and date are required' });
    }
    if (!requireSupabase(res)) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: userId, merchant: merchant.trim(), type, category,
      amount: Math.abs(Number(amount)), date, notes: notes || null
    })
      .select()
      .single();

    if (error && isMissingTransactionsTable(error)) {
      const fallback = await supabase.from('expenses').insert({
        user_id: userId,
        merchant: merchant.trim(),
        category,
        amount: Math.abs(Number(amount)),
        expense_date: date,
        description: notes || null,
        source: type === 'income' ? 'manual_income' : 'manual',
      }).select().single();
      if (fallback.error) throw fallback.error;
      return res.status(201).json(mapExpenseToTransaction(fallback.data));
    }
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create transaction', details: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { user_id: userId, merchant, type, category, amount, date, notes } = req.body;
    if (!userId || !merchant || !type || !category || amount == null || !date) {
      return res.status(400).json({ error: 'user_id, merchant, type, category, amount, and date are required' });
    }
    if (!requireSupabase(res)) return;

    const values = {
      merchant: merchant.trim(), type, category,
      amount: Math.abs(Number(amount)), date, notes: notes || null,
    };
    const { data, error } = await supabase.from('transactions')
      .update(values)
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error && isMissingTransactionsTable(error)) {
      const fallback = await supabase.from('expenses').update({
        merchant: values.merchant,
        category: values.category,
        amount: values.amount,
        expense_date: values.date,
        description: values.notes,
        source: values.type === 'income' ? 'manual_income' : 'manual',
      }).eq('id', req.params.id).eq('user_id', userId).in('source', ['manual', 'manual_income']).select().single();
      if (fallback.error) throw fallback.error;
      return res.json(mapExpenseToTransaction(fallback.data));
    }
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update transaction', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    if (!requireSupabase(res)) return;
    const { error } = await supabase.from('transactions').delete().eq('id', req.params.id).eq('user_id', userId);

    if (error && isMissingTransactionsTable(error)) {
      const fallback = await supabase.from('expenses').delete().eq('id', req.params.id).eq('user_id', userId).in('source', ['manual', 'manual_income']);
      if (fallback.error) throw fallback.error;
      return res.json({ success: true, deletedId: req.params.id });
    }
    if (error) throw error;
    res.json({ success: true, deletedId: req.params.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete transaction', details: error.message });
  }
});

module.exports = router;
