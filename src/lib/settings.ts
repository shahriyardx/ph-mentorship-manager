import "server-only"

import { TRPCError } from "@trpc/server"
import { prisma } from "./prisma"

/**
 * The Discord server every batch lives in. Configured once by an admin on
 * /admin/settings and stored on the single Settings row.
 */
export const findDiscordServerId = async () => {
  const settings = await prisma.settings.findFirst()
  return settings?.serverId || null
}

/** Same, but for flows that cannot continue without it. */
export const requireDiscordServerId = async () => {
  const serverId = await findDiscordServerId()

  if (!serverId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "No Discord server is configured yet. An admin needs to set it in Settings.",
    })
  }

  return serverId
}

/**
 * The server a specific batch lives in: its own override when set, otherwise
 * the default from Settings.
 */
export const findBatchServerId = async (batchId: string) => {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { discordServerId: true },
  })

  return batch?.discordServerId || (await findDiscordServerId())
}

/** Same, but for flows that cannot continue without it. */
export const requireBatchServerId = async (batchId: string) => {
  const serverId = await findBatchServerId(batchId)

  if (!serverId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "No Discord server is set for this batch, and there is no default in Settings.",
    })
  }

  return serverId
}
