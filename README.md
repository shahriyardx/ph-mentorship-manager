## Fullstack template
This is a nextjs template that uses tailwind, shadcn-ui, better-auth, prisma, and trpc

### How to use
- Clone the repo
- Rename `.env.example` to `.env`
- Run the docker compose file for local db, or use cloud db
- Run `bun prisma db push` to sync database
- Run `bun prisma generate` to generate prisma client
- Run `bun dev` to start the devlopment server
