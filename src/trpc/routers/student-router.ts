import z from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import { addRoleToUser, addUserToGuild } from "@/lib/discord"
import { prisma } from "@/lib/prisma"

export const studentRouter = createTRPCRouter({
  getStudentInfo: protectedProcedure.query(async ({ ctx }) => {
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

    const batch = await ctx.prisma.batch.findFirst({
      where: {
        id: student?.batchId,
      },
    })

    return { student, serverId: batch?.discordServerId ?? "" }
  }),
  joinMentorship: protectedProcedure
    .input(
      z.object({
        email: z.email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentBatch = await getCurrentBatch()
      await checkStudent(input.email, currentBatch.id)

      const account = await getAccount(ctx.session.user.id)
      const assignedStudent = await getAssignedStudent(
        input.email,
        currentBatch.id,
      )
      const mentor = await getMentor(assignedStudent.mentorId)
      const batch = await getBatch(assignedStudent.batchId)

      try {
        await addUserToGuild(
          batch?.discordServerId as string,
          account.accountId,
          account.accessToken as string,
        )
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add you to the discord server. Please try again",
        })
      }

      await ctx.prisma.student.create({
        data: {
          email: assignedStudent.email,
          userId: ctx.session.user.id,
          mentorId: assignedStudent.mentorId,
          batchId: assignedStudent.batchId,
        },
      })

      await addRoleToUser(
        batch.discordServerId as string,
        account.accountId,
        mentor.roleId as string,
      )
    }),
})

const getAssignedStudent = async (email: string, batchId: string) => {
  const assignedStudent = await prisma.studentsData.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      batchId: batchId,
    },
  })

  if (!assignedStudent)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No student found with this email",
    })

  return assignedStudent
}

const getAccount = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
    },
  })

  if (!account)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No account found for this user",
    })

  return account
}

const checkStudent = async (email: string, batchId: string) => {
  const student = await prisma.student.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      batchId: batchId,
    },
  })
  if (student)
    throw new TRPCError({
      code: "CONFLICT",
      message: "You have already joined",
    })
}

const getMentor = async (mentorId: string) => {
  const mentor = await prisma.mentor.findFirst({
    where: {
      id: mentorId,
    },
  })

  if (!mentor)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No mentor found for this student",
    })

  return mentor
}

export const getBatch = async (batchId: string) => {
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
    },
  })

  if (!batch)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No batch found with this id",
    })

  return batch
}

const getCurrentBatch = async () => {
  const batch = await prisma.batch.findFirst({
    where: {
      isCurrent: true,
    },
  })

  if (!batch)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No current batch found",
    })

  return batch
}
