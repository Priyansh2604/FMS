const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
// Serve small public helpers (session-sync) for development
app.use(express.static(path.join(__dirname, 'public')));

const transactionRoutes = require('./routes/transactions');
const investmentRoutes = require('./routes/investments');
const expenseRoutes = require('./routes/expenses');
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve frontend static files when built (single link)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Finance API is running. Frontend not built yet.');
  });
}

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
