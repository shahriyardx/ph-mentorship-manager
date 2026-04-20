import z from "zod"
import { adminProcedure, createTRPCRouter } from "../init"
import { addRoleToUser, getServer } from "@/lib/discord"
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

      const unmigratedStudents = await ctx.prisma.student.count({
        where: {
          hasGivenAccess: false,
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
        unmigratedStudents,
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

      const mentorsStudent = await Promise.all(
        mentors.map(async (mentor) => {
          const unmigratedStudents = await ctx.prisma.student.count({
            where: {
              hasGivenAccess: false,
              mentorId: mentor.id,
              batchId: input.batchId,
            },
          })

          return {
            ...mentor,
            unmigratedStudents,
          }
        }),
      )

      return mentorsStudent
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

  migrateStudents: adminProcedure
    .input(
      z.object({
        batchId: z.string(),
        mentorId: z.string().optional(),
      }),
    )
    .mutation(async function* ({ input, ctx }) {
      const batch = await ctx.prisma.batch.findFirst({
        where: { id: input.batchId },
      })

      if (!batch) {
        return
      }
      let students = []
      if (!input.mentorId) {
        students = await ctx.prisma.student.findMany({
          where: {
            batchId: input.batchId,
            hasGivenAccess: false,
          },
        })
      } else {
        students = await ctx.prisma.student.findMany({
          where: {
            batchId: input.batchId,
            hasGivenAccess: false,
            mentorId: input.mentorId,
          },
        })
      }

      let migrated = 0
      const total = students.length

      yield { migrated, total }

      for (const student of students) {
        const mentor = await ctx.prisma.mentor.findFirst({
          where: {
            batchId: input.batchId,
            id: student.mentorId,
          },
        })

        if (!mentor) {
          migrated++
          yield { migrated, total }
          continue
        }

        const account = await ctx.prisma.account.findFirst({
          where: {
            userId: student.userId,
          },
        })

        if (!account) {
          migrated++
          yield { migrated, total }
          continue
        }

        try {
          await addRoleToUser(
            batch.discordServerId as string,
            account.accountId,
            mentor.roleId as string,
          )

          await ctx.prisma.student.update({
            where: { id: student.id },
            data: {
              hasGivenAccess: true,
            },
          })

          await new Promise((res) => setTimeout(res, 250))
        } catch (err) {
          console.error(err)
        }

        migrated++
        yield { migrated, total }
      }
    }),
})
