# AgriBid – Environment Variables & Setup Guide
5zyLI0GBddC0fK9K
This guide provides a comprehensive, step-by-step walkthrough on how to obtain, generate, and configure every environment variable required to run **AgriBid** locally and in production.

---

## Quick Summary of Environment Variables

| Variable | Requirement | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| **`DATABASE_URL`** | **Required** | `postgresql://user:pass@localhost:5432/agribid` | PostgreSQL database connection string |
| **`NEXT_PUBLIC_SUPABASE_URL`** | **Required** | `https://xyz.supabase.co` | Supabase project API URL |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | **Required** | `eyJhbGci...` | Supabase public anonymous API key |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **Required** | `eyJhbGci...` | Supabase elevated admin key (used for file uploads & storage buckets) |
| **`SUPABASE_JWT_SECRET`** | **Required** | `your-supabase-jwt-secret` | Supabase JWT signing secret |
| **`JWT_SECRET`** | **Required** | Min 32 random characters | Backend access token JWT secret |
| **`REFRESH_TOKEN_SECRET`** | **Required** | Min 32 random characters | Backend refresh token JWT secret |
| **`PORT`** | Optional | `4000` | Port for Express backend API |
| **`NODE_ENV`** | Optional | `development` | Environment mode (`development`, `production`, `test`) |
| **`NEXT_PUBLIC_API_URL`** | **Required** | `http://localhost:4000/api/v1` | Backend API URL accessed by frontend |
| **`NEXT_PUBLIC_APP_URL`** | **Required** | `http://localhost:3000` | Frontend web application URL |
| **`GEMINI_API_KEY`** | **Required for AI** | `AIzaSy...` | Google Gemini AI API key for price advisor & assistance |
| **`RESEND_API_KEY`** | Optional | `re_...` | Resend API key for transaction & reset password emails |
| **`EMAIL_FROM`** | Optional | `noreply@agribid.com` | Verified email sender address |
| **`FIREBASE_*` (7 keys)** | Optional | Web Config & VAPID | Firebase Web Push Notifications credentials |
| **`FIREBASE_SERVICE_ACCOUNT_KEY`**| Optional | JSON String | Firebase Admin SDK service account key |
| **`NEXT_PUBLIC_POSTHOG_KEY`** | Optional | `phc_...` | PostHog product analytics project key |
| **`NEXT_PUBLIC_POSTHOG_HOST`** | Optional | `https://app.posthog.com` | PostHog host instance URL |
| **`SENTRY_DSN`** | Optional | `https://...@sentry.io/...` | Sentry exception and error monitoring DSN |
| **`UPSTASH_REDIS_REST_URL`** | Optional | `https://...upstash.io` | Upstash Redis URL for distributed caching/rate-limiting |
| **`UPSTASH_REDIS_REST_TOKEN`** | Optional | Token string | Upstash Redis authentication token |

---

## Detailed Step-by-Step Instructions

---

### Step 1: Database & Supabase Configuration (Required)

AgriBid uses PostgreSQL as its core database and Supabase for cloud database hosting, authentication, and file storage (product images, documents, avatars).

#### 1.1 Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and click **Sign Up** or **Sign In**.
2. Click **New Project** and select your organization.
3. Fill in:
   - **Name**: `AgriBid-Dev` (or your preferred project name)
   - **Database Password**: Set a strong password (save this securely!).
   - **Region**: Choose a region closest to your target users (e.g., *South Asia / Mumbai*).
4. Click **Create new project** and wait ~2 minutes for provision completion.

#### 1.2 Get Supabase API Credentials
1. In your Supabase Dashboard, go to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Copy the following values into your `.env`:
   - **Project URL**: Copy into `NEXT_PUBLIC_SUPABASE_URL`.
   - **`anon` `public` API Key**: Copy into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **`service_role` `secret` Key**: Copy into `SUPABASE_SERVICE_ROLE_KEY`.
3. Under **JWT Settings** on the same page:
   - Copy **JWT Secret** into `SUPABASE_JWT_SECRET`.

#### 1.3 Get Database Connection String (`DATABASE_URL`)
1. Go to **Project Settings** -> **Database**.
2. Scroll to **Connection String** and select the **URI** tab.
3. Copy the URL string. It will look like:
   `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
4. Replace `[YOUR-PASSWORD]` with the password you created in Step 1.1.
5. Paste this into `DATABASE_URL` in your `.env`.

*Alternative (Local PostgreSQL)*:
If running PostgreSQL locally via Docker or native install:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agribid
```

#### 1.4 Create Supabase Storage Buckets
1. In Supabase Dashboard, go to **Storage** (folder icon in sidebar).
2. Click **New Bucket** and create the following 4 public buckets:
   - `product-images` (Public)
   - `documents` (Public)
   - `videos` (Public)
   - `avatars` (Public)

---

### Step 2: Backend JWT Secrets & Local Security (Required)

The Node.js Express backend issues JWT tokens for user session management. You need 32+ character random secret strings for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.

#### How to Generate Secrets

**Option A: PowerShell (Windows)**
```powershell
# Run in PowerShell to generate two 32-byte hex strings:
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**Option B: Node.js Command Line**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Git Bash / Linux / macOS**
```bash
openssl rand -hex 32
```

Copy the generated random strings into `.env`:
```env
JWT_SECRET=c8f87a8b417e2908f... (your generated key 1)
REFRESH_TOKEN_SECRET=89a712f004b... (your generated key 2)
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
```

---

### Step 3: Google Gemini AI Key (Required for AI Features)

AgriBid includes AI-powered Crop Advisory, Price Recommendations, Disease Detection, and Multilingual AI Assistance powered by Google Gemini.

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API Key** (top left sidebar or center button).
4. Click **Create API Key** -> Select an existing Google Cloud project or click **Create API Key in new project**.
5. Copy the generated key (starts with `AIzaSy...`).
6. Paste into your `.env`:
```env
GEMINI_API_KEY=AIzaSyYourGeneratedGeminiKey
```

---

### Step 4: Resend Email API Key (Optional / Recommended)

Resend handles transactional emails such as Password Reset links and Notification emails.

1. Go to [Resend](https://resend.com) and create an account.
2. Navigate to **API Keys** in the sidebar.
3. Click **Create API Key**:
   - Name: `AgriBid-Dev`
   - Permission: *Full Access*
4. Copy the generated key (starts with `re_...`).
5. Set in `.env`:
```env
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=onboarding@resend.dev  # Use resend.dev domain for testing, or your verified domain
```

---

### Step 5: Firebase Cloud Messaging (Optional for Web Push Notifications)

Firebase provides browser push notifications for auction status and bids.

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** -> Name it `agribid-app` -> Continue.
3. Inside your project, click the **Web icon** (`</>`) to add a Web App.
4. App nickname: `AgriBid Web`. Click **Register app**.
5. Copy the `firebaseConfig` properties to your `.env`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=agribid-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=agribid-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=agribid-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
```
6. **Generate Web VAPID Key**:
   - In Firebase Console, go to **Project Settings** (gear icon) -> **Cloud Messaging** tab.
   - Under **Web configuration**, click **Generate key pair** under *Web Push certificates*.
   - Copy the Key pair string into `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
7. **Service Account Key (for backend Admin SDK)**:
   - Go to **Project Settings** -> **Service accounts** tab.
   - Click **Generate new private key** to download the JSON file.
   - Stringify the JSON content onto a single line and place in `FIREBASE_SERVICE_ACCOUNT_KEY`.

---

### Step 6: PostHog Analytics & Sentry Error Tracking (Optional)

#### PostHog (Product Analytics)
1. Register at [PostHog](https://posthog.com).
2. Create a project and go to **Project Settings**.
3. Copy **Project API Key** and set:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### Sentry (Error Monitoring)
1. Register at [Sentry](https://sentry.io).
2. Create a project (Select **Next.js** for frontend or **Node.js** for backend).
3. Copy the **Client DSN** from **Settings** -> **Client Keys (DSN)**:
```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

---

### Step 7: Upstash Redis (Optional for Distributed Caching)

1. Register at [Upstash](https://upstash.com).
2. Click **Create Database** -> Name: `agribid-cache`, Type: *Regional Redis*.
3. Scroll down to **REST API** section.
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`:
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

---

### Step 8: Frontend & Backend URL Configuration

For local development on your machine:
```env
# Backend listening port
PORT=4000
NODE_ENV=development

# Frontend access points
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AgriBid
```

---

## Verifying Your Setup

Once you have filled out your `.env` file at the root of the project:

1. **Test Database Connection & Run Migrations**:
   ```bash
   cd apps/backend
   npm run db:migrate
   npm run db:seed
   ```
   *Expected output*: `Migration completed successfully` and `Seed data inserted`.

2. **Start Development Servers**:
   From root directory:
   ```bash
   npm run dev
   ```

3. **Verify API Endpoints**:
   - Backend API Health: Open `http://localhost:4000/health` in browser. Should return `{"status":"ok"}`.
   - Frontend App: Open `http://localhost:3000` in browser.

---

## Deployment Environment Setup

When deploying to production platforms:

### Vercel (Frontend Deployment)
Set these variables in **Vercel Project Settings** -> **Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (Points to production backend URL e.g. `https://api.agribid.com/api/v1`)
- `NEXT_PUBLIC_APP_URL` (`https://agribid.vercel.app`)
- `NEXT_PUBLIC_FIREBASE_*` (if push notifications enabled)

### Render / Railway / Heroku (Backend Deployment)
Set these variables in your hosting provider's dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV=production`
