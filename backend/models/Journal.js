const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "userId is required"],
            index: true,
        },
        ambience: {
            type: String,
            required: [true, "ambience is required"],
        },
        text: {
            type: String,
            required: [true, "text is required"],
        },
        // Cached analysis fields (populated when user analyzes an entry)
        emotion: {
            type: String,
            default: null,
        },
        keywords: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Journal", journalSchema);
