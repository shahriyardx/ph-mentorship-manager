import z from "zod"
import { adminProcedure, createTRPCRouter } from "../init"
import { findBatchServerId, requireBatchServerId } from "@/lib/settings"
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

      const students = await ctx.prisma.student.findMany({
        where: { batchId: input.batchId },
      })

      const unassignedStudents = students.filter(
        (student) => !student.mentorId,
      ).length
      const joinedStudents = students.filter((student) => student.userId).length

      const serverId = await findBatchServerId(input.batchId)
      const discord = serverId ? await getServer(serverId) : null
      const mentors = await ctx.prisma.mentor.findMany({
        where: { batchId: input.batchId },
      })

      return {
        ...batch,
        discord,
        serverId,
        assignedStudents: students.length,
        unassignedStudents,
        joinedStudents,
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
          const joined = await ctx.prisma.student.count({
            where: {
              mentorId: mentor.id,
              batchId: input.batchId,
              userId: { not: null },
            },
          })

          return {
            ...mentor,
            joined,
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
      const serverId = await requireBatchServerId(input.batchId)
      const batch = await ctx.prisma.batch.findFirst({
        where: { id: input.batchId },
      })

      if (!batch) {
        return
      }
      // Re-applying a role is idempotent on Discord, so this doubles as a
      // repair for anyone whose role went missing.
      const students = await ctx.prisma.student.findMany({
        where: {
          batchId: input.batchId,
          userId: { not: null },
          ...(input.mentorId ? { mentorId: input.mentorId } : {}),
        },
      })

      let migrated = 0
      const total = students.length

      yield { migrated, total }

      for (const student of students) {
        const mentor = student.mentorId
          ? await ctx.prisma.mentor.findFirst({
              where: { batchId: input.batchId, id: student.mentorId },
            })
          : null

        if (!mentor) {
          migrated++
          yield { migrated, total }
          continue
        }

        const account = student.userId
          ? await ctx.prisma.account.findFirst({
              where: { userId: student.userId },
            })
          : null

        if (!account) {
          migrated++
          yield { migrated, total }
          continue
        }

        try {
          await addRoleToUser(
            serverId,
            account.accountId,
            mentor.roleId as string,
          )

          await new Promise((res) => setTimeout(res, 250))
        } catch (err) {
          console.error(err)
        }

        migrated++
        yield { migrated, total }
      }
    }),
})
