const rateLimit = require("express-rate-limit");

// General rate limiter for all API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests, please try again after 15 minutes.",
    },
});

// Stricter rate limiter for Gemini AI analysis endpoint
const analysisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Stricter limit for AI calls
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many analysis requests, please try again after 15 minutes.",
    },
});

module.exports = { apiLimiter, analysisLimiter };
