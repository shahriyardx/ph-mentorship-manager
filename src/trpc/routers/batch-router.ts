import z from "zod"
import { adminProcedure, createTRPCRouter } from "../init"
import { getServer } from "@/lib/discord"
import { BatchSetDiscordSchema } from "@/schema"

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

      if (!batch) {
        return null
      }

      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: { batchId: input.batchId },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: { batchId: input.batchId },
        include: {
          user: true,
        },
      })

      const discord = batch?.discordServerId
        ? await getServer(batch?.discordServerId)
        : null
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
          _count: {
            select: {
              studentsDatas: {
                where: {
                  batchId: input.batchId,
                },
              },
              students: {
                where: {
                  batchId: input.batchId,
                },
              },
            },
          },
        },
      })

      return mentors
    }),
  setDiscord: adminProcedure
    .input(BatchSetDiscordSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.update({
        where: { id: input.batchId },
        data: {
          discordServerId: input.discordServerId,
        },
      })
    }),
})
