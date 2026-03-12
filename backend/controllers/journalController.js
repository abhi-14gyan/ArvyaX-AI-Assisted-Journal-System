const Journal = require("../models/Journal");
const { analyzeText } = require("../services/geminiService");

/**
 * POST /api/journal
 * Create a new journal entry.
 * Auto-analyzes text with Gemini AI and stores results on the entry.
 */
const createEntry = async (req, res) => {
    try {
        const { userId, ambience, text } = req.body;

        if (!userId || !ambience || !text) {
            return res.status(400).json({
                error: "All fields are required: userId, ambience, text",
            });
        }

        // Create entry first
        const entry = await Journal.create({ userId, ambience, text });

        // Auto-analyze in background — don't block the response if it fails
        try {
            const analysis = await analyzeText(text);
            entry.emotion = analysis.emotion;
            entry.keywords = analysis.keywords;
            entry.summary = analysis.summary;
            await entry.save();
            console.log("Auto-analysis saved for entry:", entry._id);
        } catch (analysisError) {
            console.error("Auto-analysis failed (entry still saved):", analysisError.message);
        }

        // Return the entry (with or without analysis data)
        const savedEntry = await Journal.findById(entry._id);
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error("Error creating entry:", error.message);
        res.status(500).json({ error: "Failed to create journal entry" });
    }
};

/**
 * GET /api/journal/:userId
 * Return all journal entries for a given user.
 */
const getEntries = async (req, res) => {
    try {
        const { userId } = req.params;
        const entries = await Journal.find({ userId }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        console.error("Error fetching entries:", error.message);
        res.status(500).json({ error: "Failed to fetch journal entries" });
    }
};

/**
 * POST /api/journal/analyze
 * Analyze text using Gemini AI.
 * Accepts optional entryId to save analysis results back to the journal entry.
 * Returns { emotion, keywords, summary }.
 */
const analyzeEntry = async (req, res) => {
    try {
        const { text, entryId } = req.body;

        if (!text) {
            return res.status(400).json({ error: "text field is required" });
        }

        const analysis = await analyzeText(text);

        // If entryId provided, save analysis back to the entry
        if (entryId) {
            try {
                await Journal.findByIdAndUpdate(entryId, {
                    emotion: analysis.emotion,
                    keywords: analysis.keywords,
                    summary: analysis.summary,
                });
                console.log("Analysis saved to entry:", entryId);
            } catch (saveError) {
                console.error("Failed to save analysis to entry:", saveError.message);
            }
        }

        res.json(analysis);
    } catch (error) {
        console.error("Error analyzing text:", error.message);
        res.status(500).json({ error: "Failed to analyze text: " + error.message });
    }
};

/**
 * GET /api/journal/insights/:userId
 * Perform MongoDB aggregations to return user insights.
 * Returns { totalEntries, topEmotion, mostUsedAmbience, recentKeywords }.
 */
const getInsights = async (req, res) => {
    try {
        const { userId } = req.params;

        // Total entries count
        const totalEntries = await Journal.countDocuments({ userId });

        if (totalEntries === 0) {
            return res.json({
                totalEntries: 0,
                topEmotion: null,
                mostUsedAmbience: null,
                recentKeywords: [],
            });
        }

        // Top emotion aggregation
        const emotionAgg = await Journal.aggregate([
            { $match: { userId, emotion: { $ne: null } } },
            { $group: { _id: "$emotion", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]);
        const topEmotion = emotionAgg.length > 0 ? emotionAgg[0]._id : null;

        // Most used ambience aggregation
        const ambienceAgg = await Journal.aggregate([
            { $match: { userId } },
            { $group: { _id: "$ambience", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]);
        const mostUsedAmbience =
            ambienceAgg.length > 0 ? ambienceAgg[0]._id : null;

        // Recent keywords — from last 10 entries that have keywords
        const recentEntriesWithKeywords = await Journal.aggregate([
            { $match: { userId, keywords: { $exists: true, $ne: [] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $unwind: "$keywords" },
            { $group: { _id: "$keywords" } },
        ]);
        const recentKeywords = recentEntriesWithKeywords.map((k) => k._id);

        res.json({
            totalEntries,
            topEmotion,
            mostUsedAmbience,
            recentKeywords,
        });
    } catch (error) {
        console.error("Error fetching insights:", error.message);
        res.status(500).json({ error: "Failed to fetch insights" });
    }
};

module.exports = { createEntry, getEntries, analyzeEntry, getInsights };
