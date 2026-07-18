import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoints:
 * 5 attempts within 15 minutes.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    error: {
      code: 'TOO_MANY_REQUESTS',
      details: 'Login attempts exceeded. Account login rate-limited for 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for administrator API endpoints:
 * 120 requests per minute.
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per windowMs
  message: {
    success: false,
    message: 'Rate limit exceeded. Too many requests.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'You are making too many requests. Limits are 120 requests per minute.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
