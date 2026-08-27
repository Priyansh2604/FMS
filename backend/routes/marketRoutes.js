const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/quote/:symbol', marketController.getQuote);
router.get('/quotes', marketController.getMultipleQuotes);
router.get('/history/:symbol', marketController.getHistory);
router.get('/indices', marketController.getIndices);
router.get('/search', marketController.searchStocks);

module.exports = router;
