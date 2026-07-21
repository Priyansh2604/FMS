const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Demo fallback data used when MongoDB isn't connected
const demoTransactions = [
  {
    _id: 'local-1',
    user: { name: 'Demo User', email: 'demo@example.com' },
    type: 'income',
    category: 'Salary',
    amount: 2500,
    date: new Date().toISOString(),
    notes: 'Demo deposit'
  },
  {
    _id: 'local-2',
    user: { name: 'Demo User', email: 'demo@example.com' },
    type: 'expense',
    category: 'Groceries',
    amount: 120.5,
    date: new Date().toISOString(),
    notes: 'Demo expense'
  }
];

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(demoTransactions);
    }

    const transactions = await Transaction.find().populate('user', 'name email');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mock = Object.assign({ _id: `local-${Date.now()}`, date: new Date().toISOString() }, req.body);
      return res.status(201).json(mock);
    }

    const transaction = new Transaction(req.body);
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create transaction', details: error.message });
  }
});

module.exports = router;
