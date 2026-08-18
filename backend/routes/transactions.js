const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');

// Demo fallback data used when Supabase isn't configured
const demoTransactions = [
  {
    id: 'local-1',
    user: { name: 'Demo User', email: 'demo@example.com' },
    type: 'income',
    category: 'Salary',
    amount: 2500,
    date: new Date().toISOString(),
    notes: 'Demo deposit'
  },
  {
    id: 'local-2',
    user: { name: 'Demo User', email: 'demo@example.com' },
    type: 'expense',
    category: 'Groceries',
    amount: 120.5,
    date: new Date().toISOString(),
    notes: 'Demo expense'
  }
];

function useDemo() {
  return !supabase;
}

router.get('/', async (req, res) => {
  try {
    if (useDemo()) {
      return res.json(demoTransactions);
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(name, email)')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transactions', details: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (useDemo()) {
      const mock = Object.assign({ id: `local-${Date.now()}`, date: new Date().toISOString() }, req.body);
      return res.status(201).json(mock);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create transaction', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useDemo()) {
      return res.json({ success: true, deletedId: req.params.id });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, deletedId: req.params.id });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete transaction', details: error.message });
  }
});

module.exports = router;
