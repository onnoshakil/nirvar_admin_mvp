# Nirvar Admin Panel MVP

Institutional device management for Dishari tablets. One institution, one device pool, one global policy.

## Quick Start

### Prerequisites

- Node.js 20.9+ (developed on Node 24)
- PostgreSQL 14+ (local, or cloud: Supabase/Neon/Railway)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your values
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Run database migration
npm run db:migrate

# 5. Seed the Super Admin account
npm run db:seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the Super Admin credentials you set in `.env` (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`). The seed script creates that account with `mustChangePassword=false` so you can sign in immediately.

### Environment Variables

Copy `.env.example` to `.env` and fill in every value:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Local: `postgresql://postgres:postgres@localhost:5432/nirvar_admin?schema=public`. Cloud providers usually require `?sslmode=require`. |
| `AUTH_SECRET` | ✅ | Secret used to sign session JWTs. Generate with `openssl rand -base64 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`). |
| `AUTH_URL` | ✅ | Canonical app URL. `http://localhost:3000` in dev; the production domain when deployed. |
| `SUPER_ADMIN_EMAIL` | ✅ | Email for the seeded Super Admin account. |
| `SUPER_ADMIN_PASSWORD` | ✅ | Password for the seeded Super Admin account. |
| `RESEND_API_KEY` | ⚠️ | Resend API key for sending temp-password emails. Without a real key, institution/admin creation still succeeds but the credential email is skipped. |
| `EMAIL_FROM` | ⚠️ | From-address for outgoing email (must be a verified Resend sender/domain in production). |

### Database Commands

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Create and apply a new migration
npm run db:push       # Push schema to DB without migration (dev only)
npm run db:seed       # Seed the Super Admin account
npm run db:studio     # Open Prisma Studio (visual DB browser)
```

## Project Structure

```
src/
  app/
    login/              # Login page
    change-password/    # Forced password change
    (admin)/            # Authenticated layout group
      dashboard/        #   Dashboard (role-aware)
      institutions/     #   Institution list + create + detail (Super Admin)
      devices/          #   Device list + QR scanner (Inst Admin)
      students/         #   Student list (Inst Admin)
      policy/           #   Global policy editor (Inst Admin)
    api/                # API route handlers
      auth/             #   NextAuth + change password
      institutions/     #   Institution CRUD + status + admins
      devices/          #   Device registration, list, heartbeat
      students/         #   Student list + self-registration
      policy/           #   Global policy CRUD + sync status
      dashboard/        #   Dashboard metrics
  lib/
    auth.ts             # NextAuth config
    prisma.ts           # Prisma client singleton
    password.ts         # Hash, verify, generate temp password
    email.ts            # Send temp password email
    validators/         # Zod schemas for API input validation
    middleware/         # Tenant scoping helpers
  components/           # Reusable UI components
  hooks/                # TanStack Query hooks
  types/                # Shared TypeScript types
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack) — frontend + backend
- **TypeScript** — type safety
- **PostgreSQL + Prisma** — database + ORM
- **NextAuth.js v5** — authentication (JWT)
- **Ant Design** — UI components
- **TanStack Query** — server state management
- **Zod** — input validation
- **Resend** — transactional email

## Deployment

Target: **Vercel** (app) + a **managed PostgreSQL** (Supabase / Neon / Railway).

1. **Provision a production database** and copy its connection string (append `?sslmode=require` if the provider needs SSL).
2. **Create the Vercel project** and connect this Git repo.
3. **Set environment variables** in Vercel (see the table above): `DATABASE_URL`, `AUTH_SECRET` (a fresh production secret — do **not** reuse the dev one), `AUTH_URL` (your production domain, e.g. `https://admin.nirvar.app`), `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM`.
4. **Apply migrations to production** — from a machine with the production `DATABASE_URL`:
   ```bash
   npx prisma migrate deploy
   ```
   (Use `migrate deploy`, not `migrate dev`, in production — it applies committed migrations without generating new ones.)
5. **Seed the Super Admin** against production:
   ```bash
   npm run db:seed
   ```
6. **Deploy** (push to the connected branch or run `vercel --prod`).
7. **Verify**: login works, institution creation works, credential email is delivered, all pages load.

> **Note:** The Prisma client is generated into `src/generated/prisma`, which is **git-ignored**. A `postinstall` script (`prisma generate`) regenerates it automatically after `npm install`, so CI/Vercel builds work out of the box. After changing `schema.prisma`, run `npm run db:generate` locally.

## Team

- **Nahid** — Auth, Institutions, Dashboard, Deployment
- **Shakil** — Devices (QR), Students, Global Policy

See `docs/MVP_WORKPLAN_NAHID.md` and `docs/MVP_WORKPLAN_SHAKIL.md` for detailed task breakdowns.
