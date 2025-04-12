// Verify environment variables are loading
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });
console.log('Environment variables:', {
  JWT_SECRET: process.env.JWT_SECRET ? '*****' : 'NOT SET',
  CLIENT_URL: process.env.CLIENT_URL,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? '*****' : 'NOT SET'
});
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const statsRoutes = require('./routes/stats');

const app = express();

// Security middleware
app.use(helmet());

const corsOptions = {
  origin: 'http://localhost:3000', // Explicitly allow frontend port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Add CORS logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request from origin: ${req.get('origin')}`);
  next();
});

app.use(cors(corsOptions));

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB with retries and detailed logging
const connectWithRetry = () => {
  console.log('Attempting MongoDB connection...');
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url_shortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    retryReads: true
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Log connection events
mongoose.connection.on('connecting', () => console.log('MongoDB connecting...'));
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

connectWithRetry();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ error: err.message, stack: err.stack });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});