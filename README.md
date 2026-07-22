# 🌾 AgriBid – AI-Powered Farmer Marketplace

AgriBid is a production-quality, full-stack marketplace connecting farmers, buyers, logistics providers, and administrators through real-time bidding, instant purchases, AI-driven insights, and modern analytics.

## ✨ Features

- 🔴 **Live Auctions** — Real-time bidding with anti-sniping, auto-bid, reserve price
- 🤖 **AI Features** — Price advisor, crop recommendations, disease detection via Gemini
- 🗺️ **Maps** — Farm locations, nearby produce, logistics tracking via OpenStreetMap
- 📊 **Analytics** — Revenue charts, demand forecasting, market insights
- 💬 **Chat** — Real-time messaging with media support
- 📱 **PWA** — Installable, offline-ready, push notifications
- 🌍 **Multi-language** — 9 Indian languages supported in AI assistant
- 🎮 **Gamification** — XP, badges, leaderboards
- 📦 **Logistics** — Driver tracking, pickup scheduling, proof of delivery
- 🔐 **Security** — RBAC, JWT, rate limiting, input sanitization

## 🏗️ Architecture

```
agribid/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── backend/      # Node.js/Express API
└── packages/
    ├── shared/       # Shared types & utilities
    └── ui/           # Shared UI components
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10
- Supabase account (free)
- PostgreSQL (via Supabase)

### Installation

```bash
# Clone
git clone https://github.com/your-org/agribid.git
cd agribid

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development
npm run dev
```

## 🌐 Deployment

| Service | Provider | Tier |
|---------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | Supabase | Free |
| Storage | Supabase | Free |
| Email | Resend | Free |
| Analytics | PostHog | Free |
| Monitoring | Sentry | Free |

## 📖 Documentation

See `/docs` for:
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api.md)
- [Architecture Diagram](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Environment Variables](docs/env-vars.md)

## 📄 License

MIT
