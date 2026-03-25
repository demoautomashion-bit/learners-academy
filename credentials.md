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

### 🔐 Phase 4: Professional Authentication (Clerk)
To enable secure login and identity:
1.  Go to [Clerk.com](https://clerk.com) and create a new project.
2.  Add your keys to `.env`:
    ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    ```
3.  In the Clerk Dashboard:
    -   Under **User & Auth** -> **Authentication**, enable "Email Address" and "Google" (optional).
    -   Under **Configure** -> **Redirects**, set:
        -   Sign In: `/auth/login`
        -   Sign Up: `/auth/register`
        -   After Sign In: `/teacher` (or `/student` depending on your role usage)

### 🖼️ Phase 5: Media & Storage (UploadThing)
To enable image uploads for assessments:
1.  Go to [UploadThing.com](https://uploadthing.com) and create a new app.
2.  Add your keys to `.env`:
    ```bash
    UPLOADTHING_SECRET=sk_live_...
    UPLOADTHING_APP_ID=...
    ```
3.  Ensure your `next.config.mjs` allows the `utfs.io` domain for image optimization (I have already configured the code for this, but it requires the server to be restarted after adding keys).

### 📈 Phase 3: Error Monitoring (Sentry)
1.  Go to [Sentry.io](https://sentry.io).
2.  Create a Next.js project.
3.  Add your DSN to `.env`:
    ```bash
    NEXT_PUBLIC_SENTRY_DSN=https://...
    SENTRY_DSN=https://...
    ```

---

## 📦 Section 3: Dependencies
After adding the credentials, run these commands if they weren't installed automatically:
- `pnpm install` (Ensures prisma and client are present)
- `npm install @clerk/nextjs`
- `npm install @sentry/nextjs`
