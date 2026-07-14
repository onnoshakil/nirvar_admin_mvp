# Nirvar Admin Panel MVP

Institutional device management for Dishari tablets. One institution, one device pool, one global policy.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud: Supabase/Neon/Railway)

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

Open [http://localhost:3000](http://localhost:3000) and log in with the Super Admin credentials from your `.env`.

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

- **Next.js 15** (App Router) — frontend + backend
- **TypeScript** — type safety
- **PostgreSQL + Prisma** — database + ORM
- **NextAuth.js v5** — authentication (JWT)
- **Ant Design** — UI components
- **TanStack Query** — server state management
- **Zod** — input validation
- **Resend** — transactional email

## Team

- **Nahid** — Auth, Institutions, Dashboard, Deployment
- **Shakil** — Devices (QR), Students, Global Policy

See `docs/MVP_WORKPLAN_NAHID.md` and `docs/MVP_WORKPLAN_SHAKIL.md` for detailed task breakdowns.
