import { createTRPCRouter, adminOrMentorProcedure } from "../init"
import z from "zod"
import { TRPCError } from "@trpc/server"
import ExcelJS from "exceljs"

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
  exportStudents: adminOrMentorProcedure
    .input(
      z.object({
        type: z.enum(["joined", "notJoined"]),
        batchId: z.string(),
        mentorId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const mentor = await ctx.prisma.mentor.findFirst({
        where: {
          userId: input.mentorId || ctx.session.user.id,
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
