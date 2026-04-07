import { createTRPCRouter } from "../init"
import { adminRouter } from "./admin-router"
import { discordRouter } from "./discord-router"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  discord: discordRouter,
})

export type AppRouter = typeof appRouter
