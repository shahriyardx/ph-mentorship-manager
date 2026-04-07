import { createTRPCRouter, mentorProcedure } from "../init"
import z from "zod"

export const mentorRouter = createTRPCRouter({
  students: mentorProcedure.query(async ({ ctx }) => {
    return ctx.prisma.student.findMany()
  }),
})
