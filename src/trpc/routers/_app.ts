import { createTRPCRouter } from "../init"
import { adminRouter } from "./admin-router"
import { discordRouter } from "./discord-router"
import { mentorRouter } from "./mentor-router"
import { studentRouter } from "./student-router"

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  discord: discordRouter,
  mentor: mentorRouter,
  student: studentRouter,
})

export type AppRouter = typeof appRouter
