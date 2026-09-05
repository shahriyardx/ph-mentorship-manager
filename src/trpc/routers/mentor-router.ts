import { createTRPCRouter, adminOrMentorProcedure } from "../init"
import z from "zod"
import { TRPCError } from "@trpc/server"
import { findBatchServerId } from "@/lib/settings"
import ExcelJS from "exceljs"

export const mentorRouter = createTRPCRouter({
  /** Every batch this instructor runs, each with its own counts and channels. */
  overview: adminOrMentorProcedure.query(async ({ ctx }) => {
    const mentors = await ctx.prisma.mentor.findMany({
      where: { userId: ctx.session.user.id },
      include: { batch: true },
      orderBy: { createdAt: "desc" },
    })

    if (mentors.length === 0) {
      return null
    }

    const batches = await Promise.all(
      mentors.map(async (mentor) => {
        const where = mentor.batchId
          ? { mentorId: mentor.id, batchId: mentor.batchId }
          : { mentorId: mentor.id }

        const [assigned, joined] = await Promise.all([
          ctx.prisma.student.count({ where }),
          ctx.prisma.student.count({
            where: { ...where, userId: { not: null } },
          }),
        ])

        return {
          mentorId: mentor.id,
          batch: mentor.batch,
          assigned,
          joined,
          serverId: mentor.batchId
            ? await findBatchServerId(mentor.batchId)
            : null,
          announcementChannelId: mentor.announcementChannelId,
          discussionChannelId: mentor.discussionChannelId,
          helpChannelId: mentor.helpChannelId,
          resourceChannelId: mentor.resourceChannelId,
        }
      }),
    )

    return {
      batches,
      totals: {
        assigned: batches.reduce((sum, b) => sum + b.assigned, 0),
        joined: batches.reduce((sum, b) => sum + b.joined, 0),
      },
    }
  }),
  /** The batches this instructor runs, for the sidebar. */
  myBatches: adminOrMentorProcedure.query(async ({ ctx }) => {
    const mentors = await ctx.prisma.mentor.findMany({
      where: { userId: ctx.session.user.id, batchId: { not: null } },
      include: { batch: true },
      orderBy: { createdAt: "desc" },
    })

    return mentors
      .map((mentor) => mentor.batch)
      .filter((batch) => batch !== null)
  }),
  students: adminOrMentorProcedure
    .input(
      z.object({
        batchId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const mentor = await ctx.prisma.mentor.findFirst({
        where: {
          userId: ctx.session.user.id,
          batchId: input.batchId,
        },
      })

      if (!mentor) {
        return { students: [] }
      }

      const students = await ctx.prisma.student.findMany({
        where: {
          mentorId: mentor.id,
          batchId: input.batchId,
        },
        include: { user: true },
        orderBy: [{ userId: "desc" }, { name: "asc" }],
      })

      return { students }
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
          batchId: input.batchId,
        },
      })

      if (!mentor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not run this batch",
        })
      }

      const students = await ctx.prisma.student.findMany({
        where: {
          batchId: input.batchId,
          mentorId: mentor.id,
          userId: input.type === "joined" ? { not: null } : null,
        },
        orderBy: { name: "asc" },
      })

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("Students")
      sheet.columns = [
        { header: "Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 20 },
      ]
      sheet.getRow(1).font = { bold: true, name: "Arial" }
      sheet.getRow(1).alignment = { horizontal: "center" }

      students.forEach((student) => {
        sheet.addRow({
          name: student.name,
          email: student.email,
          phone: student.phone,
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      return {
        base64,
        filename: `students-${input.type}.xlsx`,
      }
    }),
})
