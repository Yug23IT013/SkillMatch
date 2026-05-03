const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for authentication routes (login, register, password change).
 * Max 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false, // Count every attempt, including successful ones
});

/**
 * General limiter applied to all API routes.
 * Max 100 requests per 15 minutes per IP to protect against abuse.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

module.exports = { authLimiter, generalLimiter };
