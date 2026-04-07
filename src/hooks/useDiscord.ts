import type { Role, Channel } from "@/types"
import { trpc } from "@/trpc/client"

type EntityMap = {
  roles: Role
  channels: Channel
}

export function useDiscord<T extends keyof EntityMap>({
  entity,
}: {
  entity: T
}) {
  const { data, status } = trpc.discord.get.useQuery({ entity })

  return { data: (data || []) as EntityMap[T][], status }
}
