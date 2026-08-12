const express = require('express');
const mongoose = require('mongoose');
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
app.use('/api/transactions', transactionRoutes);

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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fms';

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Please stop the other process and try again.`);
      process.exit(1);
    } else {
      throw error;
    }
  });
};

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('MongoDB connected');
    startServer(PORT);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    startServer(PORT);
  });
