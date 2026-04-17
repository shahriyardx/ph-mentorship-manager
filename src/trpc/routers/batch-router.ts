import z from "zod"
import { adminProcedure, createTRPCRouter } from "../init"
import { getServer } from "@/lib/discord"

export const batchRouter = createTRPCRouter({
  batchInfo: adminProcedure
    .input(
      z.object({
        batchId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const batch = await ctx.prisma.batch.findUnique({
        where: { id: input.batchId },
      })

      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: { batchId: input.batchId },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: { batchId: input.batchId },
        include: {
          user: true,
        },
      })

      const discord = await getServer(batch?.discordServerId as string)
      const mentors = await ctx.prisma.mentor.findMany({
        where: { batchId: input.batchId },
      })
      return {
        ...batch,
        discord,
        assignedStudents: assignedStudents.length,
        joinedStudents: joinedStudents.length,
        mentors: mentors.length,
      }
    }),
  mentors: adminProcedure
    .input(
      z.object({
        batchId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const mentors = await ctx.prisma.mentor.findMany({
        where: { batchId: input.batchId },
        include: {
          user: true,
        },
      })

      return mentors
    }),
})
