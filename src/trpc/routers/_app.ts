import { createTRPCRouter } from "../init"
import { adminRouter } from "./admin-router"
import { discordRouter } from "./discord-router"
import { mentorRouter } from "./mentor-router"
import { studentRouter } from "./student-router"
import { batchRouter } from "./batch-router"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  discord: discordRouter,
  mentor: mentorRouter,
  student: studentRouter,
  batch: batchRouter,
})

export type AppRouter = typeof appRouter
