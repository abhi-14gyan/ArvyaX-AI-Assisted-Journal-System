const express = require("express");
const router = express.Router();
const {
    createEntry,
    getEntries,
    analyzeEntry,
    getInsights,
} = require("../controllers/journalController");
const { analysisLimiter } = require("../middleware/rateLimiter");

// POST /api/journal — Create a new journal entry
router.post("/", createEntry);

// GET /api/journal/insights/:userId — Get user insights (must be before /:userId)
router.get("/insights/:userId", getInsights);

// POST /api/journal/analyze — Analyze text with Gemini AI (stricter rate limit)
router.post("/analyze", analysisLimiter, analyzeEntry);

// GET /api/journal/:userId — Get all entries for a user
router.get("/:userId", getEntries);

module.exports = router;
