require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET is missing or too short. Set a long random value in .env');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // needed for correct IPs behind Render's proxy

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '100kb' }));

const limiter = (minutes, limit, message) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

// Slow down password guessing and expensive operations
app.use('/api/auth/login', limiter(15, 20, 'Too many login attempts. Try again later.'));
app.use('/api/auth/register', limiter(60, 20, 'Too many sign-ups. Try again later.'));
app.post('/api/analysis', limiter(60, 30, 'Too many analysis requests. Try again later.'));
app.post('/api/analysis/full', limiter(60, 15, 'Too many analysis requests. Try again later.'));
app.post('/api/roadmap/generate', limiter(60, 15, 'Too many roadmap requests. Try again later.'));
app.post('/api/reports/:id/email', limiter(60, 10, 'Too many emails sent. Try again later.'));
app.delete('/api/auth/me', limiter(15, 10, 'Too many attempts. Try again later.'));

app.get('/', (req, res) => res.json({ message: 'CareerPath API is running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));