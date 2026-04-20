import "server-only"
import { createHydrationHelpers } from "@trpc/react-query/rsc"
import { cache } from "react"
import { createCallerFactory, createTRPCContext } from "./init"
import { makeQueryClient } from "./query-client"
import { appRouter } from "./routers/_app"
import { headers } from "next/headers"

export const getQueryClient = cache(makeQueryClient)
const caller = createCallerFactory(appRouter)(async () => {
  // biome-ignore lint/suspicious/noExplicitAny: its anything
  return createTRPCContext({ req: { headers: await headers() } as any })
})
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
)
