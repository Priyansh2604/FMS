const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

// Serve API
app.use('/api/transactions', transactionRoutes);

// Serve frontend static files when built (single link)
const path = require('path');
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

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (MongoDB connected)`));
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  // Start server anyway so routes can serve demo/mock data
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (MongoDB unavailable, running with fallback)`));
});
