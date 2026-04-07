import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { env } from "./env"

export const getAuth = () => {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DICSORD_CLIENT_SECRET,
        token: env.DISCORD_TOKEN,
      },
    },
  })
}
