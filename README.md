# Programming Hero — Mentorship Manager

Runs the one-to-one mentorship programme on Discord. Admins import a batch of
students, hand them to instructors, and the app builds each instructor's private
Discord channels and grants students access when they join.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| API | tRPC v11 |
| Database | PostgreSQL via Prisma 7 |
| Auth | better-auth, Discord OAuth only |
| UI | Tailwind v4, shadcn/ui |
| Tooling | Bun, Biome |

## Getting started

### 1. Discord application

Create an app at <https://discord.com/developers/applications>.

**OAuth2** — add a redirect URL:

```
http://localhost:3000/api/auth/callback/discord
```

The app requests the `identify`, `email` and `guilds.join` scopes. `guilds.join`
is what lets the server pull a student into the Discord server on their behalf.

**Bot** — create one, copy its token, and invite it to your Discord server with
**Manage Roles** and **Manage Channels**.

> The bot's own role must sit **above** the roles it creates in the server's role
> list, or Discord refuses to assign them.

### 2. Environment

```bash
cp .env.example .env
```

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Random string, 32+ characters |
| `BETTER_AUTH_URL` | Base URL of the app |
| `NEXT_PUBLIC_BASE_URL` | Same; optional on Vercel |
| `DISCORD_CLIENT_ID` | OAuth2 client id |
| `DISCORD_CLIENT_SECRET` | OAuth2 client secret |
| `DISCORD_BOT_TOKEN` | Bot token |

The Discord **server** is not an environment variable. An admin picks it once at
`/admin/settings` and it is stored in the database.

### 3. Database and run

```bash
bun install
docker compose up -d          # local Postgres, or point DATABASE_URL elsewhere
bun prisma migrate deploy     # apply migrations
bun prisma generate           # generate the client
bun dev
```

| Script | Does |
|---|---|
| `bun dev` | Development server |
| `bun run build` / `bun start` | Production build and serve |
| `bun run lint` | Biome check |
| `bun run format` | Biome format, writes in place |

### 4. First run

1. Open the site and sign in with Discord.
2. Visit `/admin`. With no admins in the database yet, the first person to do
   this is promoted to **superadmin** (`src/proxy.ts`).
3. Set the Discord server at `/admin/settings`.
4. Create a batch and mark it **current**.

## How it works

### Roles

`User.role` is one of `user`, `mentor`, `admin`, `superadmin`. Users cannot set
their own role — better-auth is configured with `input: false` on the field.

Enforced in two places: `src/proxy.ts` guards the `/admin` and `/mentor` URLs,
and `src/trpc/init.ts` guards every API call.

| Procedure | Who |
|---|---|
| `publicProcedure` | anyone |
| `protectedProcedure` | any signed-in user |
| `adminOrMentorProcedure` | mentor, admin, superadmin |
| `adminProcedure` | admin, superadmin |
| `superadminProcedure` | superadmin only |

Batches, the Discord server and maintenance mode are superadmin-only. Only a
superadmin can grant admin, and nobody can change a superadmin's role.

### The flow

```
1. Import    Excel (Name, Email, Phone) into a batch  ->  unassigned
2. Assign    paste emails on an instructor            ->  mentorId set
3. Join      student signs in, claims their email     ->  userId set
4. Access    they receive the instructor's student role
```

A student cannot join until they have been assigned to an instructor.

### One student table

`student` holds one row per student per batch and covers the whole lifecycle, so
state is derived rather than duplicated:

| State | How you know |
|---|---|
| imported | the row exists |
| assigned | `mentorId` is set |
| joined | `userId` is set |

Joining writes `userId` only after the Discord calls succeed, so a joined student
always has their role.

### Instructors

One `mentor` record per user **per batch**, so someone can run several cohorts at
once, each with its own students and channels.

Adding an instructor creates, in that batch's Discord server:

```
<name>-squad                    category
 ├─ announcements    text       instructor posts, students read
 ├─ discussion       text       everyone talks
 ├─ help             forum      students open their own posts
 └─ resources        text       instructor shares links, students read
```

plus two roles — `<name>-mentor` (green, held by the instructor) and
`<name>-squad` (uncoloured, held by their students). `@everyone` is denied on the
category, so squads cannot see each other. Permissions are attached to the
**roles**, not to the person, so channels keep working if an account changes.

**Re-sync roles** on the instructor page re-applies every student's role. Discord
role assignment is idempotent, so it doubles as a repair.

## Layout

```
prisma/schema.prisma        data model
src/proxy.ts                route guard + first-admin bootstrap
src/lib/auth.ts             better-auth setup
src/lib/discord.ts          Discord REST wrapper
src/lib/settings.ts         resolves the server id for a batch
src/lib/student-import.ts   Excel parsing
src/trpc/init.ts            procedures and role middleware
src/trpc/utils.ts           createMentor — builds channels and roles
src/trpc/routers/           admin, batch, mentor, student, discord
src/app/(public)            landing page and mentor sign-in
src/app/(dashboard)         admin and mentor dashboards
```

## Notes

- `addUserToGuild` uses the student's OAuth access token, which Discord expires
  after about a week. A student who signed in long ago may need to sign out and
  back in before claiming their email.
- Deleting an instructor removes their record and releases their students back to
  the unassigned pool. It does **not** delete their Discord channels or roles.
