import { env } from "@/lib/env"
import {
  createTRPCRouter,
  adminOrMentorProcedure,
  protectedProcedure,
} from "../init"
import z from "zod"
import { TRPCError } from "@trpc/server"
import ExcelJS from "exceljs"

export const mentorRouter = createTRPCRouter({
  applyForMentor: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    })

    if (
      !user ||
      user.appliedForMentor ||
      user.role === "mentor" ||
      user.role === "admin" ||
      user.role === "superadmin"
    )
      return

    await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        appliedForMentor: true,
      },
    })

    const settings = await ctx.prisma.settings.findFirst()

    if (settings?.dashboardLogChannelId) {
      await sendChannelMessage(
        settings.dashboardLogChannelId,
        `${user.name} has requested to be a mentor and awaiting approval. \nVisit ${env.BETTER_AUTH_URL}/admin to assign them as mentor`,
      )
    }
  }),
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
  exportStudents: adminOrMentorProcedure
    .input(
      z.object({
        type: z.enum(["joined", "notJoined"]),
        batchId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const mentor = await ctx.prisma.mentor.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      })

      if (!mentor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mentor not found",
        })
      }

      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: {
          batchId: input.batchId,
          mentorId: mentor.id,
        },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: {
          batchId: input.batchId,
          mentorId: mentor.id,
        },
      })

      const notJoinedStudents = assignedStudents.filter(
        (student) => !joinedStudents.some((j) => j.email === student.email),
      )

      const students =
        input.type === "joined" ? joinedStudents : notJoinedStudents

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("Emails")
      sheet.columns = [{ header: "email", key: "email", width: 30 }]
      sheet.getRow(1).font = { bold: true, name: "Arial" }
      sheet.getRow(1).alignment = { horizontal: "center" }

      students.forEach((student) => {
        sheet.addRow({ email: student.email })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      return {
        base64,
        filename: `students-${input.type}.xlsx`,
      }
    }),
})

const sendChannelMessage = async (channelId: string, message: string) => {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    },
  )

  if (!res.ok) {
    console.error("Failed to send message:", await res.text())
  }
}
