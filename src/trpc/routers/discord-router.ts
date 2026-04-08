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
        guildId: z.string().optional(),
        entity: z.enum(["roles", "channels", "servers"]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const settings = await ctx.prisma.settings.findFirst()

      let url: string

      if (input.entity === "servers") {
        url = "https://discord.com/api/v10/users/@me/guilds"
      } else {
        url = `https://discord.com/api/v10/guilds/${input.guildId ?? settings?.serverId}/${input.entity}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bot ${env.DISCORD_TOKEN}`,
          "User-Agent": "CustomCommands (https://makeown.cc, 1.0)",
        },
      })

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

      if (input.entity === "servers") {
        return data.map((s: { id: string; name: string }) => ({
          id: s.id,
          name: s.name,
        }))
      }

      return data
    }),
})
