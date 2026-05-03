const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const { generalLimiter } = require('./src/middleware/rateLimiter');

dotenv.config();

// Fail fast if any critical environment variables are missing
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('   Copy backend/.env.example to backend/.env and fill in all values.\n');
  process.exit(1);
}

connectDB();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost port, Postman, and no-origin requests
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Apply general rate limiter to all API routes (100 req / 15 min per IP)
app.use('/api', generalLimiter);

// Routes
// Authentication routes apply tight limiters specifically for login and register
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/student', require('./src/routes/student'));
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/recommendations', require('./src/routes/recommendations'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/admin', require('./src/routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'SkillMatch API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SkillMatch server running on port ${PORT}`));

module.exports = app;
