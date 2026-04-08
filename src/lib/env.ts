import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DICSORD_CLIENT_SECRET: z.string(),
    DISCORD_TOKEN: z.string(),
    SERVER_ID: z.string(),
    ADMIN_ROLE_ID: z.string(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DICSORD_CLIENT_SECRET: process.env.DICSORD_CLIENT_SECRET,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    SERVER_ID: process.env.SERVER_ID,
    ADMIN_ROLE_ID: process.env.ADMIN_ROLE_ID,
  },
})
