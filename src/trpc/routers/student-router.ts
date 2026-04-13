import z from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import { addUserToGuild, giveChannelAccess } from "@/lib/auth"

export const studentRouter = createTRPCRouter({
  settings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst()
    return settings
  }),
  getStudentInfo: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst()

    const student = await ctx.prisma.student.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
      },
    })

    return { student, serverId: settings?.serverId ?? "" }
  }),

  joinMentorship: protectedProcedure
    .input(
      z.object({
        email: z.email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findFirst({
        where: {
          email: {
            equals: input.email,
            mode: "insensitive",
          },
        },
      })

      if (student)
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already joined",
        })

      const assignedStudent = await ctx.prisma.studentsData.findFirst({
        where: {
          email: {
            equals: input.email,
            mode: "insensitive",
          },
        },
      })

      if (!assignedStudent)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No student found with this email",
        })

      await ctx.prisma.student.create({
        data: {
          email: assignedStudent.email,
          userId: ctx.session.user.id,
          mentorId: assignedStudent.mentorId,
          batchId: assignedStudent.batchId,
        },
      })

      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      })

      if (!account)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account found for this user",
        })

      const mentor = await ctx.prisma.mentor.findFirst({
        where: {
          id: assignedStudent.mentorId,
        },
      })

      await addUserToGuild(account.accessToken as string, account.accountId)

      if (!mentor)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No mentor found for this student",
        })
      await giveChannelAccess(account.accountId, mentor.discordChannelId)
    }),
})
