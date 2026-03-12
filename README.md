# 🌿 ArvyaX AI-Assisted Journal System

A full-stack MERN application where users log nature session experiences and get AI-powered analysis using Google Gemini.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini 1.5 Flash |
| Caching | node-cache (in-memory) |
| Rate Limiting | express-rate-limit |

## Features

- **Journal Entries** — Create and view nature session logs with ambience tags
- **AI Analysis** — Analyze journal text with Gemini AI (emotion detection, keyword extraction, summary)
- **Insights Dashboard** — MongoDB aggregations for top emotion, most-used ambience, recent keywords
- **Caching** — In-memory caching of AI analysis results (1-hour TTL) to reduce API calls
- **Rate Limiting** — 100 req/15min globally, 30 req/15min for AI analysis

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Google Gemini API Key](https://aistudio.google.com/apikey) (free tier)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "Arvyax Technologies"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create or edit the `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/arvyax-journal
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Replace `MONGO_URI` with your MongoDB Atlas connection string if using cloud database. Replace `GEMINI_API_KEY` with your actual key from [Google AI Studio](https://aistudio.google.com/apikey).

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/journal` | Create a new journal entry |
| `GET` | `/api/journal/:userId` | Get all entries for a user |
| `POST` | `/api/journal/analyze` | Analyze text with Gemini AI |
| `GET` | `/api/journal/insights/:userId` | Get aggregated user insights |

### Example: Create Entry

```json
POST /api/journal
{
  "userId": "123",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain."
}
```

### Example: Analyze Text

```json
POST /api/journal/analyze
{
  "text": "I felt calm today after listening to the rain"
}
```

**Response:**
```json
{
  "emotion": "calm",
  "keywords": ["rain", "nature", "peace"],
  "summary": "User experienced relaxation during the forest session"
}
```

### Example: Get Insights

```json
GET /api/journal/insights/123

{
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["focus", "nature", "rain"]
}
```

---

## Project Structure

```
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Rate limiter
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes
│   ├── services/               # Gemini AI service
│   └── server.js               # Entry point
├── frontend/
│   └── src/
│       ├── api/                # API service layer
│       ├── components/         # React components
│       ├── App.jsx             # Main application
│       └── App.css             # Styling
├── README.md
└── ARCHITECTURE.md
```

---

## License

MIT
