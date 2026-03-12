# 🏗️ Architecture — ArvyaX AI-Assisted Journal System

## System Overview

```
┌─────────────┐     HTTP      ┌──────────────┐    Mongoose    ┌─────────┐
│  React SPA  │ ────────────► │  Express API │ ────────────► │ MongoDB │
│  (Vite)     │ ◄──────────── │  (Node.js)   │ ◄──────────── │         │
└─────────────┘     JSON      └──────┬───────┘               └─────────┘
                                     │
                              ┌──────▼───────┐
                              │ Google Gemini│
                              │  (2.5 Flash) │
                              └──────────────┘
```

---

## How would you scale this to 100k users?

### Database Layer
- **MongoDB Atlas** with auto-scaling replica sets and sharding by `userId` for horizontal partitioning
- **Indexes** on `userId` and `createdAt` for fast query performance
- **Read replicas** to distribute read-heavy insight queries

### Application Layer
- **Horizontal scaling** — Deploy multiple stateless Express instances behind a load balancer (e.g., AWS ALB, Nginx)
- **Container orchestration** with Kubernetes or AWS ECS for auto-scaling based on CPU/memory metrics
- **PM2 cluster mode** at minimum for utilizing all CPU cores on a single server

### Caching Layer
- Replace in-memory `node-cache` with **Redis** cluster for shared, distributed caching across instances
- Cache insight aggregations with TTL (invalidate on new entry creation)
- Cache user entry lists with short TTLs

### Infrastructure
- **CDN** (CloudFront, Cloudflare) for static React assets
- **Rate limiting** via Redis-backed store (shared across instances)
- **Message queues** (Bull/BullMQ with Redis) for async AI analysis to prevent blocking requests

---

## How would you reduce LLM cost?

1. **Aggressive Caching** — Cache analysis results keyed by normalized text hash. Current implementation uses MD5-keyed `node-cache`. At scale, use Redis with long TTLs (24hrs+)

2. **Batch Processing** — Instead of real-time per-request analysis, queue multiple texts and send them in batch to Gemini during off-peak hours

3. **Prompt Optimization** — Keep prompts minimal. Current prompt is ~80 tokens. Use `responseMimeType: "application/json"` (already implemented) to avoid wasted tokens on formatting

4. **Model Selection** — Use `gemini-2.5-flash` (already chosen) which is the most cost-effective model. Fall back to cheaper models for simpler texts

5. **Deduplication** — Normalize text (lowercase, trim whitespace) before hashing to maximize cache hits for semantically identical inputs

6. **Rate Limiting** — Current implementation limits AI analysis to 30 requests per 15 minutes per IP, preventing abuse

---

## How would you cache repeated analysis?

### Current Implementation (Single-Server)
```
Request Text  →  MD5 Hash  →  Check node-cache  →  Hit? Return cached
                                                 →  Miss? Call Gemini → Cache result (1hr TTL)
```

- **Library**: `node-cache` with 1-hour TTL
- **Key**: MD5 hash of `text.trim().toLowerCase()`
- **Value**: `{ emotion, keywords, summary }` JSON

### Production Implementation (Multi-Server)
1. **Replace** `node-cache` with **Redis**
   - Enables shared cache across horizontally scaled instances
   - Supports persistence (survives restarts)
   - Supports TTL + LRU eviction policies

2. **Two-Layer Cache**
   - L1: In-process memory cache (100ms lookup) for hot entries
   - L2: Redis (1-5ms lookup) for distributed cache

3. **Database-Level Cache**
   - Store analysis results directly on Journal documents (`emotion`, `keywords`, `summary` fields — already in the schema)
   - If a user re-analyzes the same entry, return from MongoDB without calling Gemini

---

## How would you protect sensitive journal data?

### Encryption
- **At rest**: MongoDB Atlas encrypts all data at rest with AES-256. For self-hosted, enable MongoDB's Encrypted Storage Engine
- **In transit**: Enforce TLS/HTTPS for all API communication. Use HSTS headers
- **Field-level encryption**: Use MongoDB Client-Side Field Level Encryption (CSFLE) for the `text` field containing personal journal content

### Authentication & Authorization
- Implement **JWT-based authentication** (e.g., Passport.js or Auth0)
- Every API endpoint validates that `userId` in the request matches the authenticated user's ID
- Use **bcrypt** for password hashing

### Access Control
- **Principle of least privilege** — API keys and database credentials stored in environment variables, never committed to code
- **RBAC** (Role-Based Access Control) for admin vs. user access

### API Security
- **Rate limiting** (implemented) prevents brute-force and DoS attacks
- **Input validation** and **sanitization** on all endpoints (prevent NoSQL injection)
- **CORS** configured to allow only the frontend origin in production
- **Helmet.js** for security headers (CSP, X-Frame-Options, etc.)

### Compliance
- **Data retention policies** — Allow users to delete their data (GDPR right to erasure)
- **Audit logging** — Track who accessed what data and when
- **Regular security audits** and dependency vulnerability scanning (`npm audit`)
