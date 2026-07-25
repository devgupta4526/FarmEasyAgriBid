# AgriBid – Complete Documentation

## Table of Contents

1. [Architecture Overview](#architecture)
2. [Database Schema](#database-schema)
3. [API Documentation](#api-documentation)
4. [Environment Variables](#environment-variables)
5. [Deployment Guide](#deployment-guide)
6. [User Flows](#user-flows)
7. [Security](#security)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         AgriBid Platform                    │
├─────────────┬───────────────────┬───────────────────────────┤
│  Frontend   │      Backend      │       Services            │
│  (Next.js)  │   (Node.js API)   │                           │
│             │                   │  ┌─────────────────────┐  │
│  Vercel     │   Render Free     │  │ Supabase (DB+Auth)  │  │
│             │                   │  │ Supabase Storage    │  │
│  React 19   │  Express.js       │  │ Google Gemini AI    │  │
│  TypeScript │  PostgreSQL       │  │ Resend Email        │  │
│  Tailwind   │  Socket.IO        │  │ Firebase FCM        │  │
│  shadcn/ui  │  JWT Auth         │  │ PostHog Analytics   │  │
│  Zustand    │  RBAC Middleware  │  │ Sentry Monitoring   │  │
│  TanStack   │  Helmet Security  │  └─────────────────────┘  │
│  React Query│  Rate Limiting    │                           │
└─────────────┴───────────────────┴───────────────────────────┘
```

### Directory Structure

```
agribid/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── auth/           # Auth pages
│   │   │   ├── marketplace/    # Product listings
│   │   │   ├── auctions/       # Live auction pages
│   │   │   ├── ai/             # AI advisor
│   │   │   └── dashboard/      # Role dashboards
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/             # shadcn/ui base components
│   │   │   └── providers/      # Context providers
│   │   ├── store/              # Zustand state stores
│   │   ├── lib/                # API client, utilities
│   │   └── hooks/              # Custom hooks
│   │
│   └── backend/                # Node.js API
│       └── src/
│           ├── routes/         # Express route handlers
│           ├── middleware/      # Auth, validation, rate limiting
│           ├── socket/         # Socket.IO real-time events
│           ├── db/             # DB pool, migrations, seed
│           └── utils/          # Logger, helpers
│
├── packages/                   # Shared packages (future)
├── docs/                       # Documentation
├── docker-compose.yml          # Local development
├── turbo.json                  # Monorepo task pipeline
└── .env.example                # Environment template
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All platform users (farmers, buyers, logistics, admins) |
| `farmer_profiles` | Extended farmer data: farm details, KYC, bank |
| `buyer_profiles` | Extended buyer data: company, GST |
| `logistics_profiles` | Driver data: vehicle, license, location |
| `categories` | Product categories (14 built-in) |
| `products` | All product listings |
| `auctions` | Auction configuration and state |
| `bids` | Individual bids per auction |
| `auto_bids` | Max-bid auto-bidding settings |
| `reverse_auctions` | Buyer-initiated demand auctions |
| `orders` | Order lifecycle management |
| `order_tracking` | Order status history |
| `deliveries` | Logistics delivery tracking |
| `wallets` | User wallet balances |
| `wallet_transactions` | Full transaction history |
| `chat_rooms` | Direct message rooms |
| `chat_messages` | Individual chat messages |
| `reviews` | User and product reviews |
| `notifications` | In-app notifications |
| `wishlists` | Saved products with price alerts |
| `saved_searches` | Saved search queries |
| `coupons` | Discount coupon configuration |
| `coupon_usage` | Per-user coupon redemption |
| `referral_rewards` | Referral tracking |
| `badges` | Gamification badges |
| `user_badges` | User badge achievements |
| `inventory_logs` | Stock change audit trail |
| `complaints` | Dispute management |
| `announcements` | Admin broadcast messages |
| `faqs` | Help center content |
| `audit_logs` | Admin activity tracking |
| `ai_requests` | AI usage logs |
| `price_history` | Historical price data |

---

## API Documentation

### Base URL
```
Development: http://localhost:4000/api/v1
Production: https://api.agribid.onrender.com/api/v1
```

### Authentication
All protected routes require:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login with email/phone |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Send password reset email |

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (with filters) |
| GET | `/products/:id` | Get product details |
| POST | `/products` | Create product (farmer) |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Archive product |
| POST | `/products/:id/like` | Toggle like |

**Query Parameters for GET /products:**
- `search` — text search
- `category` — category slug
- `minPrice`, `maxPrice` — price range
- `isOrganic` — boolean filter
- `listingType` — auction/instant_buy/both
- `state`, `district` — location filter
- `sortBy` — created_at/price_asc/price_desc/views/likes
- `page`, `limit` — pagination

#### Auctions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auctions` | List auctions by status |
| GET | `/auctions/:id` | Get auction with bid history |
| POST | `/auctions` | Create auction (farmer) |
| POST | `/auctions/:id/bid` | Place bid (buyer) |
| POST | `/auctions/:id/auto-bid` | Set auto-bid |
| POST | `/auctions/:id/buy-now` | Instant purchase |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List my orders |
| GET | `/orders/:id` | Order details + tracking |
| POST | `/orders` | Create order (buyer) |
| PATCH | `/orders/:id/status` | Update order status |

#### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/price-advisor` | Get market price analysis |
| POST | `/ai/crop-advisor` | Get crop recommendations |
| POST | `/ai/disease-assistant` | Diagnose plant disease |
| POST | `/ai/market-forecast` | Market demand forecast |
| POST | `/ai/chat` | AI assistant (9 languages) |

All AI endpoints: Rate limited to 30 req/hour per user.

#### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Platform stats |
| GET | `/admin/users` | List users with filters |
| PATCH | `/admin/users/:id/status` | Change user status |
| GET | `/admin/kyc` | Pending KYC list |
| PATCH | `/admin/kyc/:userId` | Approve/reject KYC |
| GET | `/admin/audit-logs` | Activity audit trail |
| POST | `/admin/announcements` | Create announcement |

---

## Real-Time Events (Socket.IO)

### Client Events (emit)
| Event | Payload | Description |
|-------|---------|-------------|
| `join_auction` | `auctionId: string` | Subscribe to auction updates |
| `leave_auction` | `auctionId: string` | Unsubscribe |
| `join_chat` | `roomId: string` | Join chat room |
| `typing` | `{roomId, isTyping}` | Typing indicator |
| `driver_location` | `{orderId, lat, lng}` | Driver updates position |

### Server Events (on)
| Event | Payload | Description |
|-------|---------|-------------|
| `new_bid` | `{bid, current_bid, ends_at}` | New bid placed |
| `auction_ended` | `{reason, winner_id, price}` | Auction finished |
| `new_message` | `{message}` | New chat message |
| `user_typing` | `{userId, isTyping}` | Typing status |
| `driver_location_update` | `{lat, lng, timestamp}` | Live driver position |

---

## Environment Variables

For step-by-step instructions on obtaining all API keys and configuring `.env`, refer to the detailed [Environment Setup Guide](file:///e:/FarmEasyAgriBid/FarmEasyAgriBid/docs/ENV_SETUP_GUIDE.md).

Key variables overview:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32 chars |
| `REFRESH_TOKEN_SECRET` | Yes | Min 32 chars |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | For file uploads |
| `GEMINI_API_KEY` | Yes | Google Gemini AI |
| `RESEND_API_KEY` | No | Email notifications |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | No | Push notifications |

---

## Deployment Guide

For a complete step-by-step walkthrough on deploying AgriBid 100% free of cost, see the dedicated [Free Deployment Guide](file:///e:/FarmEasyAgriBid/FarmEasyAgriBid/docs/FREE_DEPLOYMENT_GUIDE.md).

### Quick Deployment Overview:

#### Frontend (Vercel)
1. Push repo to GitHub.
2. Connect repo to Vercel and set Root Directory to `apps/web`.
3. Set environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, etc.).
4. Deploy — Vercel auto-deploys on push to `main`.

#### Backend (Render)
1. Create Web Service on render.com.
2. Connect GitHub repo and set **Root Directory** to `apps/backend`.
3. Build command: `npm ci && npm run build`
4. Start command: `node dist/index.js`
5. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).

#### Database (Supabase)
1. Create project at supabase.com.
2. Run SQL migrations (`001_initial_schema.sql` and `002_seed_categories.sql`).
3. Create 4 public storage buckets (`product-images`, `documents`, `videos`, `avatars`).
4. Copy `DATABASE_URL` from Settings > Database.

---

## Security

- **JWT Authentication** with 7-day access tokens and 30-day refresh tokens
- **RBAC** enforced on every protected endpoint
- **Rate Limiting** — global 100 req/15min, auth 10 req/15min, AI 30 req/hr
- **Helmet.js** — security headers (XSS, HSTS, CSP)
- **Bcrypt** — password hashing with 12 rounds
- **SQL Injection** — prevented via parameterized queries only
- **Input Sanitization** — via express-validator on all inputs
- **Audit Logs** — all admin actions logged
- **Secrets** — never hardcoded, loaded from environment
- **No 0.0.0.0 binding** — server binds to 127.0.0.1
- **Non-root Docker** — containers run as uid 1001
- **CSP Headers** — restrict resource origins

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agribid.com | Admin@1234 |
| Farmer | farmer@agribid.com | Farmer@1234 |
| Buyer | buyer@agribid.com | Buyer@1234 |
