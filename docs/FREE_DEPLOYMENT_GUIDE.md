# AgriBid – 100% Free Production Deployment Guide

This guide provides step-by-step instructions for deploying the entire **AgriBid** platform (Database, Backend API with WebSockets, and Next.js Frontend) completely **FREE of cost** using industry-standard cloud providers:

- **Database & File Storage**: [Supabase](https://supabase.com) (Free Tier)
- **Backend API & WebSockets**: [Render](https://render.com) (Free Web Service)
- **Frontend Web App**: [Vercel](https://vercel.com) (Free Hobby Tier)
- **Optional Redis Cache**: [Upstash](https://upstash.com) (Free Tier)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       AgriBid Platform                      │
├───────────────────────┬─────────────────────────────────────┤
│  Frontend             │  Vercel (Free Hobby Tier)           │
│  (Next.js 15)         │  URL: https://agribid.vercel.app    │
├───────────────────────┼─────────────────────────────────────┤
│  Backend API          │  Render (Free Web Service)          │
│  (Node.js + Express)  │  URL: https://agribid-api.onrender.com│
├───────────────────────┼─────────────────────────────────────┤
│  Database & Storage   │  Supabase (Free Tier)               │
│  (PostgreSQL + S3)    │  PostgreSQL DB + 4 Storage Buckets  │
└───────────────────────┴─────────────────────────────────────┘
```

---

## Step 1: Deploy Database & Storage on Supabase (Free)

### 1.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com) and click **Sign Up** (or login with GitHub).
2. Click **New Project**:
   - **Name**: `agribid-prod`
   - **Database Password**: Generate a strong password (save it!).
   - **Region**: Select the region closest to your users.
3. Click **Create new project** (~2 mins setup).

### 1.2 Run Database Migrations
1. In your Supabase Dashboard, click **SQL Editor** (left menu).
2. Open the migration file in your code editor: `apps/backend/src/db/migrations/001_initial_schema.sql`.
3. Copy the entire file content, paste it into the Supabase SQL Editor, and click **Run**.
4. Open `apps/backend/src/db/migrations/002_seed_categories.sql`, copy its content, paste into SQL Editor, and click **Run**.

*Alternative (CLI Migration)*:
Run from your local terminal pointing to production `DATABASE_URL`:
```bash
# In apps/backend directory:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" npm run db:migrate
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" npm run db:seed
```

### 1.3 Create Public Storage Buckets
1. In Supabase Dashboard, navigate to **Storage**.
2. Create 4 new buckets and toggle **Public Bucket** to ON for each:
   - `product-images`
   - `documents`
   - `videos`
   - `avatars`

### 1.4 Copy Credentials
Save these values from **Project Settings** -> **API & Database**:
- `DATABASE_URL` (under Connection String -> URI)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Deploy Backend API on Render (Free)

Render offers a free tier for Node.js web services that supports HTTP REST endpoints and Socket.IO WebSockets.

### 2.1 Prepare GitHub Repository
Ensure your latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Web Service
1. Go to [Render](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`FarmEasyAgriBid`).
4. Configure the service settings:
   - **Name**: `agribid-api` (or custom name)
   - **Region**: Same region as your Supabase DB (e.g. *Singapore* or *Frankfurt*).
   - **Branch**: `main`
   - **Root Directory**: `apps/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: **Free** (0.1 CPU, 512 MB RAM)

### 2.3 Set Environment Variables on Render
Scroll down to **Environment Variables** and add the following:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Set environment mode |
| `PORT` | `10000` | Default port used by Render |
| `DATABASE_URL` | `postgresql://postgres:...@...supabase.co:5432/postgres` | Your Supabase DB URI |
| `JWT_SECRET` | `your-32-char-random-jwt-secret` | Generate random string |
| `REFRESH_TOKEN_SECRET` | `your-32-char-random-refresh-secret` | Generate random string |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Admin Key |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API Key |
| `NEXT_PUBLIC_APP_URL` | `https://agribid.vercel.app` | Your Vercel frontend URL (Step 3) |
| `PLATFORM_FEE_PERCENT` | `2.5` | Optional fee percentage |

5. Click **Create Web Service**.
6. Render will build and deploy your API. Once finished, copy your Backend Service URL:
   `https://agribid-api.onrender.com`

---

## Step 3: Deploy Frontend Web App on Vercel (Free)

Vercel provides free, optimized hosting for Next.js applications with global CDN and SSL certificates.

### 3.1 Import Project to Vercel
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository (`FarmEasyAgriBid`) and click **Import**.

### 3.2 Configure Build Settings
In the configuration screen:
- **Framework Preset**: Next.js
- **Root Directory**: Click *Edit* and select **`apps/web`**.
- **Build Command**: Default (`next build`) or `npm run build`
- **Output Directory**: Default (`.next`)

### 3.3 Set Environment Variables on Vercel
Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://agribid-api.onrender.com/api/v1` *(Your Render Backend URL)* |
| `NEXT_PUBLIC_APP_URL` | `https://agribid.vercel.app` *(Your Vercel URL)* |
| `NEXT_PUBLIC_APP_NAME` | `AgriBid` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

4. Click **Deploy**.
5. Vercel will compile the Next.js app (~1-2 mins). Once completed, click **Visit** to open your live application!

---

## Step 4: Keep Free Tier Services 100% Active (Zero-Downtime Workaround)

### Understanding Free Tier Behavior
1. **Render Free Tier Spin-Down**: Free web services on Render go to sleep after 15 minutes of zero HTTP traffic. The first request after sleep takes ~30 seconds to wake up (cold start).
2. **Supabase Inactivity Pause**: Supabase pauses databases after 7 days of complete inactivity.

### Free 24/7 Keeping-Alive Solution (UptimeRobot)
To prevent your free Render API from sleeping and maintain instant response times:

1. Sign up for a free account at [UptimeRobot](https://uptimerobot.com).
2. Click **Add New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `AgriBid Backend Ping`
   - **URL (or IP)**: `https://agribid-api.onrender.com/health`
   - **Monitoring Interval**: Every 5 or 10 minutes
3. Click **Create Monitor**.

*Result*: UptimeRobot will ping your `/health` endpoint every 10 minutes. This completely prevents Render from sleeping and ensures 100% free 24/7 instant response!

---

## Verification & Testing Checklist

- [x] **Backend Health Check**: Open `https://agribid-api.onrender.com/health` in browser. Should respond `{"status":"ok"}`.
- [x] **Frontend Load**: Open `https://agribid.vercel.app`. Verify home page and UI render cleanly.
- [x] **User Registration/Login**: Create a test account (Farmer or Buyer) and verify authentication succeeds.
- [x] **Database Seed Check**: Verify products and categories populate from Supabase.
- [x] **AI Assistant Check**: Navigate to `/ai/crop-advisor` or price advisor and test an AI prompt.
- [x] **Image Upload**: Create a product listing and upload an image to confirm Supabase Storage uploads work.

---

## Summary of Free Limits

| Service | Free Plan Allowance | Is It Sufficient? |
| :--- | :--- | :--- |
| **Vercel** | 100 GB Bandwidth/mo, unlimited builds | Yes! Excellent for frontend. |
| **Render** | 750 free instance hours/month | Yes! Covers 24/7 usage for 1 web service. |
| **Supabase** | 500 MB DB storage, 1 GB file storage, 50k monthly active users | Yes! Ample room for demo & MVP usage. |
| **Google Gemini** | 15 Requests/min (Free Tier API) | Yes! Perfect for testing & dev. |
| **Upstash Redis** | 10,000 requests/day | Yes! Great for rate limiting & cache. |
