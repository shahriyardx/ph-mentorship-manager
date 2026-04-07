import { env } from "@/lib/env"
import { createTRPCRouter, adminProcedure } from "@/trpc/init"
import { z } from "zod"

const TEXTABLE_CHANNEL_TYPES = new Set([
  0, // GUILD_TEXT
  5, // GUILD_ANNOUNCEMENT
  10, // ANNOUNCEMENT_THREAD
  11, // PUBLIC_THREAD
  12, // PRIVATE_THREAD
])

export const discordRouter = createTRPCRouter({
  get: adminProcedure
    .input(
      z.object({
        entity: z.enum(["roles", "channels"]),
      }),
    )
    .query(async ({ input }) => {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${env.SERVER_ID}/${input.entity}`,
        {
          headers: {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
            "User-Agent": "CustomCommands (https://makeown.cc, 1.0)",
          },
        },
      )
      if (!response.ok) return []

      const data = await response.json()

      if (input.entity === "channels") {
        return data.filter((c: { type: number }) =>
          TEXTABLE_CHANNEL_TYPES.has(c.type),
        )
      }
      if (input.entity === "roles") {
        return data.filter(
          (r: { managed: boolean; name: string }) =>
            !r.managed && r.name !== "@everyone",
        )
      }
      return data
    }),
})
