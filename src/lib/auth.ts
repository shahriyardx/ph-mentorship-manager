import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { env } from "./env"

const isAdmin = async (discordUserId: string) => {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${env.SERVER_ID}/members/${discordUserId}`,
    {
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
    },
  )

  if (!res.ok) {
    console.error("Failed to fetch member:", await res.text())
    return false
  }

  const member = await res.json()
  return member.roles.includes(env.ADMIN_ROLE_ID)
}

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
    databaseHooks: {
      account: {
        create: {
          after: async (account) => {
            const admin = await isAdmin(account.accountId)
            if (admin) {
              await prisma.user.update({
                where: {
                  id: account.userId,
                },
                data: {
                  role: "admin",
                },
              })
            }
          },
        },
      },
    },
  })
}
export type Auth = ReturnType<typeof getAuth>

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

export const giveChannelAccess = async (
  discordUserId: string,
  channelId: string,
) => {
  await fetch(
    `https://discord.com/api/v10/channels/${channelId}/permissions/${discordUserId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: discordUserId,
        type: 1, // 1 = member overwrite
        allow: (
          BigInt(1 << 10) | // VIEW_CHANNEL
          BigInt(1 << 11) | // SEND_MESSAGES
          BigInt(1 << 16) | // READ_MESSAGE_HISTORY
          BigInt(1 << 14) | // EMBED_LINKS
          BigInt(1 << 15) | // ATTACH_FILES
          BigInt(1 << 6)
        ) // ADD_REACTIONS
          .toString(),
        deny: "0",
      }),
    },
  )
}
