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
| `BETTER_AUTH_SECRET` | Random string, 32+ characters (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public URL of the app |
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

## Deployment

### Before the first deploy

- Point `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL` at the real https origin.
- Add `<your-domain>/api/auth/callback/discord` to the Discord app's OAuth2
  redirect URLs. Sign-in fails with a redirect mismatch otherwise.
- Generate a fresh `BETTER_AUTH_SECRET`. Never reuse the development one.
- Invite the bot to the production Discord server and check its role sits above
  the roles it will create.

### Migrations

Run them as a **release step** — after the image is built, before the new
version serves traffic:

```bash
bun prisma migrate deploy
```

Use `migrate deploy`, never `migrate dev` or `db push`, against a real database.
`migrate deploy` only applies committed migrations and never drops anything.

The Docker image deliberately does **not** run migrations during build: a build
has no database, and building an image must not mutate a live one.

### Docker

The `Dockerfile` is a multi-stage build producing a Next.js standalone server.

```bash
docker build -t mentorship-manager .

docker run -d --name mentorship \
  -p 3000:3000 \
  -e DATABASE_URL="postgres://user:pass@host:5432/db" \
  -e BETTER_AUTH_SECRET="..." \
  -e BETTER_AUTH_URL="https://your-domain" \
  -e NEXT_PUBLIC_BASE_URL="https://your-domain" \
  -e DISCORD_CLIENT_ID="..." \
  -e DISCORD_CLIENT_SECRET="..." \
  -e DISCORD_BOT_TOKEN="..." \
  mentorship-manager
```

The build sets `SKIP_ENV_VALIDATION=1`, so no secrets are needed to produce an
image — they are supplied when the container runs. `NEXT_PUBLIC_BASE_URL` is the
one exception in spirit: it is inlined into the client bundle at build time, so
if you rely on it rather than same-origin requests, pass it as a build arg too.

`.dockerignore` keeps `.env`, `node_modules` and `.next` out of the image — the
first of those matters, since `COPY . .` would otherwise bake your secrets into
an image layer.

`docker-compose.yml` provides Postgres only, for local development. It does not
run the app.

### Vercel

Works without changes. Add all the environment variables above, then run
`bun prisma migrate deploy` against the production database from your machine or
CI — Vercel builds cannot reach a private database.

### Deployment checklist

1. `bun run lint` and `bun run build` pass.
2. Environment variables set on the host.
3. `bun prisma migrate deploy` applied.
4. Deploy, then sign in and confirm `/admin` loads.
5. On a brand-new database, the first person to visit `/admin` becomes
   superadmin — do this yourself immediately, before sharing the URL.

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
