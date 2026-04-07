import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { env } from "./env"

export const getAuth = () => {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL: env.BETTER_AUTH_URL,
    user: {
      additionalFields: {
        role: {
          type: ["user", "admin", "mentor"],
          required: true,
          defaultValue: "user",
          input: false,
        },
      },
    },
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DICSORD_CLIENT_SECRET,
        scope: ["identify", "email", "guilds.join"],
      },
    },
  })
}

export const addUserToGuild = async (
  accessToken: string,
  discordUserId: string,
) => {
  await fetch(
    `https://discord.com/api/v10/guilds/${env.SERVER_ID}/members/${discordUserId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    },
  )
}
