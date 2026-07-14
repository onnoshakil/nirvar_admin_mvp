# Nirvar Admin Panel MVP — Developer Setup Guide

> For: Nahid & Shakil
> Last verified: 14 July 2026
> Build status: Clean (0 errors, 0 warnings)

---

## Prerequisites

Install these before starting:

| Tool | Version | How to check | Install |
|------|---------|--------------|---------|
| **Node.js** | 18+ | `node -v` | https://nodejs.org |
| **npm** | 9+ | `npm -v` | Comes with Node.js |
| **PostgreSQL** | 14+ | `psql --version` | https://www.postgresql.org/download/ |
| **Git** | Any | `git --version` | https://git-scm.com |

### PostgreSQL Options

Pick one:

- **Local install** — Install PostgreSQL on your machine. Default port 5432.
- **Docker** — `docker run -d --name nirvar-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`
- **Cloud** — Use [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) (all have free tiers)

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repo-url> nirvar_admin_mvp
cd nirvar_admin_mvp
```

### 2. Install Dependencies

```bash
npm install
```

This installs all 16 production dependencies and 8 dev dependencies. Takes ~30 seconds.

### 3. Create Your Environment File

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# Your PostgreSQL connection string
# Local: postgresql://postgres:postgres@localhost:5432/nirvar_admin?schema=public
# Docker: same as above
# Supabase/Neon: use the connection string they give you
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nirvar_admin?schema=public"

# Generate a random secret: run `openssl rand -base64 32` in your terminal
AUTH_SECRET="paste-your-random-string-here"

# Leave as-is for local dev
AUTH_URL="http://localhost:3000"

# Super Admin login credentials (used by seed script)
SUPER_ADMIN_EMAIL="super@onnorokom.com"
SUPER_ADMIN_PASSWORD="Super@dmin123"

# Email — get a free API key from https://resend.com/signup
# Leave the placeholder if you're not testing email yet — institution creation will still work,
# the temp password email just won't send
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@nirvar.app"
```

### 4. Create the Database

If using local PostgreSQL:

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE nirvar_admin;"
```

If using Docker:

```bash
docker exec -it nirvar-pg psql -U postgres -c "CREATE DATABASE nirvar_admin;"
```

If using Supabase/Neon/Railway: the database is already created — just use the connection string they provide.

### 5. Generate the Prisma Client

```bash
npm run db:generate
```

This generates TypeScript types from the schema into `src/generated/prisma/`. You must run this:
- After cloning the repo (generated files are gitignored)
- After any schema change

### 6. Run Database Migration

```bash
npm run db:migrate
```

This creates all tables in your database. It will ask you for a migration name — just type something like `init` and press Enter.

You should see output like:
```
Applying migration `20260714_init`
✅ Your database is now in sync with your schema.
```

### 7. Seed the Super Admin Account

```bash
npm run db:seed
```

Expected output:
```
Super Admin created: super@onnorokom.com
```

This creates the Super Admin user you'll use to log in.

### 8. Start the Dev Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the login page.

Log in with:
- **Email:** `super@onnorokom.com` (or whatever you set in `.env`)
- **Password:** `Super@dmin123` (or whatever you set in `.env`)

You should land on the dashboard. You're ready to code.

---

## Verify Your Setup

Run these three checks to make sure everything is working:

```bash
# 1. TypeScript — should print nothing (no errors)
npx tsc --noEmit

# 2. Lint — should print nothing (no warnings)
npm run lint

# 3. Build — should succeed with all routes listed
npm run build
```

If all three pass, your setup is correct.

---

## Daily Workflow

### Starting Work

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Regenerate Prisma client (in case schema changed)
npm run db:generate

# 4. Apply any new migrations
npm run db:migrate

# 5. Start the dev server
npm run dev
```

### Creating a Feature Branch

```bash
# Nahid's branches
git checkout -b nahid/feature-name

# Shakil's branches
git checkout -b shakil/feature-name
```

### After Modifying the Prisma Schema

**Only one person should modify the schema at a time.** Coordinate before changing it.

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate the updated client
npm run db:generate
# 3. Create a migration
npm run db:migrate
# 4. Commit both the schema and migration files
```

### Checking Your Work Before Pushing

```bash
# Run all three checks
npx tsc --noEmit && npm run lint && npm run build
```

If this passes, your code is safe to push.

---

## Available Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build (run before pushing to catch errors) |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client from schema |
| `npm run db:migrate` | Create and apply a new database migration |
| `npm run db:push` | Push schema to DB without migration (quick dev iteration) |
| `npm run db:seed` | Seed the Super Admin account |
| `npm run db:studio` | Open Prisma Studio (visual DB browser at localhost:5555) |

---

## Project Structure — What You Need to Know

```
prisma/
  schema.prisma        ← Database models. DO NOT edit without coordinating.
  seed.ts              ← Seeds Super Admin. Run once.
  migrations/          ← Auto-generated. Commit these.

src/
  app/
    login/             ← Login page (done)
    change-password/   ← Forced password change page (done)
    (admin)/           ← All authenticated pages live here
      layout.tsx       ← Sidebar + header shell (done)
      dashboard/       ← Nahid's task
      institutions/    ← Nahid's task
      devices/         ← Shakil's task
      students/        ← Shakil's task
      policy/          ← Shakil's task
    api/               ← All API routes (all implemented with working logic)

  lib/
    auth.ts            ← NextAuth config (done)
    prisma.ts          ← Database client singleton (done)
    password.ts        ← Hash, verify, generate (done)
    email.ts           ← Send temp password emails (done)
    validators/        ← Zod schemas for all API inputs (done)

  components/          ← Shared UI components
  hooks/               ← TanStack Query hooks for each feature (done)
  types/               ← Shared TypeScript types (done)
  generated/prisma/    ← Auto-generated Prisma client (gitignored)
```

### What's Already Built vs. What You Need to Build

**Already built and working:**
- Login page with error handling
- Change password page
- Admin layout shell (sidebar + header with role-based nav)
- All 18 API routes (auth, institutions, devices, students, policy, dashboard)
- All Zod validators
- All TanStack Query hooks
- Prisma schema + client setup
- Shared types
- Password utilities
- Email sending

**You need to build (pages have TODO comments):**
- **Nahid:** Dashboard stat cards, institution list table, create institution form, institution detail page
- **Shakil:** QR scanner component, device list table, student list table, policy editor form, sync status display

---

## How Auth Works (For Both Devs)

### In Pages (Client Components)

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyPage() {
  const { data: session } = useSession();

  // session.user.role     → "SUPER_ADMIN" or "INST_ADMIN"
  // session.user.id       → user's ID
  // session.user.institutionId → institution ID (null for Super Admin)
}
```

### In API Routes

```ts
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  // Not logged in
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Wrong role
  if (session.user.role !== "INST_ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use institutionId for scoping queries
  const devices = await prisma.deviceRegistration.findMany({
    where: { institutionId: session.user.institutionId! },
  });
}
```

### Mobile App APIs (No Auth)

These three routes have NO auth check — they're called by the Nirvar mobile app:

- `POST /api/devices/heartbeat` — device reports alive + policy version
- `POST /api/students/register` — student creates profile on device
- `GET /api/policy/current?deviceId=X` — device fetches its policy

---

## Troubleshooting

### "Cannot find module '@/generated/prisma/client'"
Run `npm run db:generate`. The generated files are gitignored, so you need to regenerate after every clone.

### "Connection refused" or database errors
Check that PostgreSQL is running and your `DATABASE_URL` in `.env` is correct. Test with:
```bash
psql "your-connection-string" -c "SELECT 1;"
```

### "NEXTAUTH_SECRET" or auth errors
Make sure `AUTH_SECRET` is set in your `.env`. Generate one with:
```bash
openssl rand -base64 32
```

### Migration conflicts
If two people create migrations at the same time, you'll get a conflict. Fix by:
1. Pull the other person's migration first
2. Run `npm run db:migrate` to apply it
3. Then create yours

### Port 3000 already in use
```bash
# Find and kill the process
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

---

## Git Rules

1. **Never push directly to `main`.** Use feature branches + PRs.
2. **Branch naming:** `nahid/feature-name` or `shakil/feature-name`
3. **One Prisma schema.** Coordinate before modifying `prisma/schema.prisma`.
4. **Run checks before pushing:** `npx tsc --noEmit && npm run lint && npm run build`
5. **Commit generated migration files** (the `prisma/migrations/` folder). Do NOT commit `src/generated/prisma/`.
6. **Never commit `.env`** — it's gitignored. Only commit `.env.example`.
