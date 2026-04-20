import { createTRPCRouter, adminOrMentorProcedure } from "../init"
import z from "zod"

export const mentorRouter = createTRPCRouter({
  students: adminOrMentorProcedure
    .input(
      z.object({
        batchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const mentor = await ctx.prisma.mentor.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      })

      if (!mentor) {
        return { assignedStudents: [], joinedStudents: [] }
      }

      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: {
          mentorId: mentor?.id,
          batchId: input.batchId,
        },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: {
          mentorId: mentor?.id,
          batchId: input.batchId,
        },
        include: {
          user: true,
        },
      })

      return { assignedStudents, joinedStudents }
    }),
})
