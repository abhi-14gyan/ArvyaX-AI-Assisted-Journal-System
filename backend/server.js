const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const journalRoutes = require("./routes/journal");
const { apiLimiter } = require("./middleware/rateLimiter");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Apply general rate limiter to all /api routes
app.use("/api", apiLimiter);

// Routes
app.use("/api/journal", journalRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "ArvyaX Journal API is running" });
});

// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
