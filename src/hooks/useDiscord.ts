import type { Role, Channel, Server } from "@/types"
import { trpc } from "@/trpc/client"

type EntityMap = {
  roles: Role
  channels: Channel
  servers: Server
}

export function useDiscord<T extends keyof EntityMap>({
  guildId,
  entity,
}: {
  entity: T
}) {
  const { data, status } = trpc.discord.get.useQuery({ entity, guildId })

  return { data: (data || []) as EntityMap[T][], status }
}
