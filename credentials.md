# Technical Credentials & Manual Setup Guide

This file tracks the external services and credentials required to move the project to production. 

---

## 🛠️ Section 1: Environment Variables (`.env`)

Add the following keys to your `.env` file in the project root:

```env
# PHASE 1: Database (Neon.tech)
DATABASE_URL="postgres://user:password@endpoint.neon.tech/neondb?sslmode=require"

# PHASE 4: Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# PHASE 3: Error Monitoring (Sentry)
SENTRY_DSN="https://...@...ingest.sentry.io/..."
```

---

## 🚀 Section 2: Manual Setup Steps

### 1. Neon Database (Phase 1)
1.  **Sign Up**: Go to [Neon.tech](https://neon.tech/) and create an account.
2.  **Create Project**: Name it `learners-academy`.
3.  **Get Connection String**: 
    - Go to the Dashboard.
    - Select "Connection String".
    - Choose "Prisma" from the dropdown.
    - Copy the URL into your `.env` as `DATABASE_URL`.
4.  **Run Migrations**: Once the URL is added, I will need you to run:
    - `npx prisma db push` (This creates the tables in the cloud).
    - `npx prisma generate` (This generates the custom database client).

### 2. Clerk Authentication (Phase 4)
1.  **Sign Up**: Go to [Clerk.com](https://clerk.com/).
2.  **Create Application**: Name it `Learner's Academy`.
3.  **Select Providers**: Choose Email and Google.
4.  **Get Keys**: Copy the Publishable and Secret keys into `.env`.

### 3. Sentry Monitoring (Phase 3)
1.  **Sign Up**: Go to [Sentry.io](https://sentry.io/).
2.  **Create Project**: Choose "Next.js" as the platform.
3.  **Get DSN**: Copy the DSN URL into `.env`.

---

## 📦 Section 3: Dependencies
After adding the credentials, run these commands if they weren't installed automatically:
- `pnpm install` (Ensures prisma and client are present)
- `npm install @clerk/nextjs`
- `npm install @sentry/nextjs`
