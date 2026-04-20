import { getServers, getTextChannels } from "@/lib/discord"
import { createTRPCRouter, adminProcedure } from "@/trpc/init"
import { z } from "zod"

export const discordRouter = createTRPCRouter({
  getServers: adminProcedure.query(async () => {
    const servers = await getServers()
    return servers
  }),
  getTextChannels: adminProcedure
    .input(
      z.object({
        guildId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const textChennels = await getTextChannels(input.guildId)
      return textChennels
    }),
})
