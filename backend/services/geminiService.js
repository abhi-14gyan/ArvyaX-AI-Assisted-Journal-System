const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache");
const crypto = require("crypto");

// In-memory cache — TTL of 1 hour
const analysisCache = new NodeCache({ stdTTL: 3600 });

/**
 * Generate a hash key from the input text for cache lookup.
 */
function getCacheKey(text) {
    return crypto.createHash("md5").update(text.trim().toLowerCase()).digest("hex");
}

/**
 * Analyze journal text using Google Gemini 1.5 Flash.
 * Returns { emotion, keywords, summary }.
 * Results are cached in-memory to reduce API calls.
 */
async function analyzeText(text) {
    const cacheKey = getCacheKey(text);

    // Check cache first
    const cached = analysisCache.get(cacheKey);
    if (cached) {
        console.log("Cache hit for analysis");
        return cached;
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const prompt = `Analyze the following journal entry from a nature session. Return a JSON object with exactly these fields:
- "emotion": a single word describing the dominant emotion (e.g., "calm", "happy", "anxious", "peaceful")
- "keywords": an array of 3-5 relevant keywords extracted from the text
- "summary": a one-sentence summary of the user's experience

Journal entry: "${text}"

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        throw new Error("Failed to parse Gemini response as JSON");
    }

    // Validate the response structure
    if (!analysis.emotion || !analysis.keywords || !analysis.summary) {
        throw new Error("Gemini response missing required fields");
    }

    // Cache the result
    analysisCache.set(cacheKey, analysis);
    console.log("Analysis cached");

    return analysis;
}

module.exports = { analyzeText };
