import { parseStudentsWorkbook } from "@/lib/student-import"
import { findBatchServerId } from "@/lib/settings"
import {
  AddMentorSchema,
  AddStudentSchema,
  AssignStudentsSchema,
  BatchSchema,
  BatchUpdateSchema,
} from "@/schema"
import {
  adminOrMentorProcedure,
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  superadminProcedure,
} from "../init"
import z from "zod"
import ExcelJS from "exceljs"
import { createMentor } from "../utils"
import { TRPCError } from "@trpc/server"
import type { UserRole } from "@/generated/prisma/enums"

export const adminRouter = createTRPCRouter({
  settings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.settings.findFirst()
  }),
  toggleMaintenanceMode: superadminProcedure.mutation(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst()
    if (settings) {
      await ctx.prisma.settings.update({
        where: { id: settings.id },
        data: {
          maintenanceMode: !settings.maintenanceMode,
        },
      })
    } else {
      await ctx.prisma.settings.create({
        data: {
          maintenanceMode: true,
        },
      })
    }
  }),
  overview: adminProcedure.query(async ({ ctx }) => {
    const [
      batches,
      mentors,
      users,
      assigned,
      joined,
      unassigned,
      mentorsWithoutBatch,
      pendingMentorRequests,
      settings,
      currentBatch,
    ] = await Promise.all([
      ctx.prisma.batch.count(),
      ctx.prisma.mentor.count(),
      ctx.prisma.user.count(),
      ctx.prisma.student.count(),
      ctx.prisma.student.count({ where: { userId: { not: null } } }),
      ctx.prisma.student.count({ where: { mentorId: null } }),
      ctx.prisma.mentor.count({ where: { batchId: null } }),
      ctx.prisma.user.count({
        where: { appliedForMentor: true, role: "user" },
      }),
      ctx.prisma.settings.findFirst(),
      ctx.prisma.batch.findFirst({ where: { isCurrent: true } }),
    ])

    const currentBatchStats = currentBatch
      ? {
          id: currentBatch.id,
          name: currentBatch.name,
          assigned: await ctx.prisma.student.count({
            where: { batchId: currentBatch.id },
          }),
          joined: await ctx.prisma.student.count({
            where: { batchId: currentBatch.id, userId: { not: null } },
          }),
          mentors: await ctx.prisma.mentor.count({
            where: { batchId: currentBatch.id },
          }),
        }
      : null

    return {
      batches,
      mentors,
      users,
      assigned,
      joined,
      unassigned,
      mentorsWithoutBatch,
      pendingMentorRequests,
      hasDiscordServer: Boolean(settings?.serverId),
      maintenanceMode: Boolean(settings?.maintenanceMode),
      currentBatch: currentBatchStats,
    }
  }),
  setDiscordServer: superadminProcedure
    .input(z.object({ serverId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const settings = await ctx.prisma.settings.findFirst()

      if (!settings) {
        await ctx.prisma.settings.create({
          data: { serverId: input.serverId },
        })
        return
      }

      await ctx.prisma.settings.update({
        where: { id: settings.id },
        data: { serverId: input.serverId },
      })
    }),
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        (input.role === "admin" || input.role === "superadmin") &&
        ctx.session.user.role !== "superadmin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only superadmins can make users admin or superadmin",
        })
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      if (user.role === "superadmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Unable to update role of superadmins",
        })
      }

      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role as UserRole },
      })
    }),
  addBatch: superadminProcedure
    .input(BatchSchema)
    .mutation(async ({ input, ctx }) => {
      const batch = await ctx.prisma.batch.create({
        data: {
          name: input.name,
          discordServerId: input.discordServerId || null,
        },
      })

      const settings = await ctx.prisma.settings.findFirst()
      if (!settings) {
        await ctx.prisma.settings.create({
          data: {
            currentBatchId: batch.id,
          },
        })
      } else {
        await ctx.prisma.settings.update({
          where: {
            id: settings.id,
          },
          data: {
            currentBatchId: batch.id,
          },
        })
      }
    }),
  instructorCandidates: adminProcedure
    .input(z.object({ batchId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      // Only hide people who already run THIS batch — a mentor may run several.
      const existing = await ctx.prisma.mentor.findMany({
        where: input?.batchId ? { batchId: input.batchId } : { id: "" },
        select: { userId: true },
      })
      const taken = new Set(existing.map((mentor) => mentor.userId))

      const users = await ctx.prisma.user.findMany({
        orderBy: [{ appliedForMentor: "desc" }, { name: "asc" }],
      })

      return users
        .filter((user) => !taken.has(user.id))
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          appliedForMentor: user.appliedForMentor,
        }))
    }),
  addInstructor: adminProcedure
    .input(z.object({ userId: z.string(), batchId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }

      const batch = await ctx.prisma.batch.findUnique({
        where: { id: input.batchId },
      })

      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Batch not found" })
      }

      const existing = await ctx.prisma.mentor.findFirst({
        where: { userId: input.userId, batchId: input.batchId },
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That user already instructs this batch",
        })
      }

      // Promote plain users; leave admin and superadmin roles alone.
      if (user.role === "user") {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: { role: "mentor", appliedForMentor: false },
        })
      }

      await createMentor({ userId: user.id, batchId: batch.id })
    }),
  instructors: adminProcedure
    .input(z.object({ batchId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const mentors = await ctx.prisma.mentor.findMany({
        where: input?.batchId ? { batchId: input.batchId } : {},
        include: {
          user: true,
          batch: true,
          _count: { select: { students: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      return Promise.all(
        mentors.map(async (mentor) => ({
          ...mentor,
          joined: await ctx.prisma.student.count({
            where: { mentorId: mentor.id, userId: { not: null } },
          }),
        })),
      )
    }),
  instructorDetail: adminProcedure
    .input(z.object({ mentorId: z.string() }))
    .query(async ({ input, ctx }) => {
      const mentor = await ctx.prisma.mentor.findUnique({
        where: { id: input.mentorId },
        include: { user: true, batch: true },
      })

      if (!mentor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instructor not found",
        })
      }

      const where = mentor.batchId
        ? { mentorId: mentor.id, batchId: mentor.batchId }
        : { mentorId: mentor.id }

      const students = await ctx.prisma.student.findMany({
        where,
        include: { user: true },
        orderBy: [{ userId: "desc" }, { name: "asc" }],
      })

      const serverId = mentor.batchId
        ? await findBatchServerId(mentor.batchId)
        : null

      return { mentor, students, serverId }
    }),
  updateBatch: superadminProcedure
    .input(BatchUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.update({
        where: { id: input.id },
        data: {
          name: input.name,
          discordServerId: input.discordServerId || null,
        },
      })
    }),
  setCurrentBatch: superadminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.updateMany({
        where: {
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      })

      await ctx.prisma.batch.update({
        where: {
          id: input.id,
        },
        data: {
          isCurrent: true,
        },
      })
    }),
  deleteBatch: superadminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.delete({
        where: {
          id: input.id,
        },
      })
    }),
  batches: adminOrMentorProcedure.query(async ({ ctx }) => {
    const batches = await ctx.prisma.batch.findMany({
      include: {
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return Promise.all(
      batches.map(async (batch) => ({
        ...batch,
        joined: await ctx.prisma.student.count({
          where: { batchId: batch.id, userId: { not: null } },
        }),
      })),
    )
  }),
  users: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
  }),
  appliedForMentor: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        appliedForMentor: true,
      },
    })
  }),
  addMentor: adminProcedure
    .input(AddMentorSchema)
    .mutation(async ({ input, ctx }) => {
      for (const mentorUserId of input.mentors) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: mentorUserId,
          },
        })

        const batch = await ctx.prisma.batch.findFirst({
          where: {
            id: input.batchId,
          },
        })

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          })
        }

        if (!batch) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Batch not found",
          })
        }

        await createMentor({
          userId: mentorUserId,
          batchId: batch.id,
        })
      }
    }),
  deleteMentor: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const mentor = await ctx.prisma.mentor.findUnique({
        where: {
          id: input.id,
        },
      })

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: mentor?.userId,
        },
      })

      if (!mentor || !user) {
        throw new Error("Mentor not found")
      }

      await ctx.prisma.mentor.delete({
        where: {
          id: input.id,
        },
      })

      await ctx.prisma.user.update({
        where: {
          id: mentor.userId,
        },
        data: {
          role: user.role === "mentor" ? "user" : user.role,
        },
      })
    }),

  mentors: adminProcedure.query(async ({ ctx }) => {
    const mentors = await ctx.prisma.user.findMany({
      where: {
        role: {
          in: ["mentor", "admin", "superadmin"],
        },
      },
    })

    return mentors
  }),
  mentorsNotAddedToBatch: adminProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input, ctx }) => {
      const mentors = await ctx.prisma.user.findMany({
        where: {
          role: {
            in: ["mentor", "admin", "superadmin"],
          },
        },
      })

      const addedMentor = await ctx.prisma.mentor.findMany({
        where: {
          batchId: input.batchId,
        },
      })

      const unassignedMentors = mentors.filter(
        (mentor) => !addedMentor.find((m) => m.userId === mentor.id),
      )

      return unassignedMentors
    }),
  deleteStudent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.student.delete({
        where: {
          id: input.id,
        },
      })
    }),
  addStudents: adminProcedure
    .input(AddStudentSchema.extend({ batchId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let parsed: Awaited<ReturnType<typeof parseStudentsWorkbook>>

      try {
        parsed = await parseStudentsWorkbook(input.file)
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "The file could not be read as an Excel file",
        })
      }

      if (parsed.students.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            parsed.errors[0]?.reason ?? "No students were found in the file",
        })
      }

      const { count } = await ctx.prisma.student.createMany({
        // Imported unassigned; an admin hands them to an instructor after.
        data: parsed.students.map((student) => ({
          name: student.name,
          email: student.email,
          phone: student.phone,
          batchId: input.batchId,
          mentorId: null,
        })),
        skipDuplicates: true,
      })

      return {
        imported: count,
        alreadyInBatch: parsed.students.length - count,
        duplicatesInFile: parsed.duplicatesInFile,
        errors: parsed.errors,
      }
    }),
  assignStudents: adminProcedure
    .input(
      AssignStudentsSchema.extend({
        mentorId: z.string(),
        batchId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const emails = [
        ...new Set(
          (
            input.emails.match(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            ) ?? []
          ).map((email) => email.toLowerCase()),
        ),
      ]

      if (emails.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid email addresses were found in that text",
        })
      }

      const mentor = await ctx.prisma.mentor.findFirst({
        where: { id: input.mentorId, batchId: input.batchId },
      })

      if (!mentor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That instructor does not run this batch",
        })
      }

      const rows = await ctx.prisma.student.findMany({
        where: { batchId: input.batchId },
      })
      const byEmail = new Map(rows.map((row) => [row.email.toLowerCase(), row]))

      // Someone who already joined has Discord roles tied to their instructor,
      // so moving them needs more than a database write. Report, do not guess.
      const joined = await ctx.prisma.student.findMany({
        where: { batchId: input.batchId },
      })
      const joinedEmails = new Set(joined.map((s) => s.email.toLowerCase()))

      const assign: string[] = []
      const moved: string[] = []
      const notInBatch: string[] = []
      const alreadyTheirs: string[] = []
      const blockedJoined: string[] = []

      for (const email of emails) {
        const row = byEmail.get(email)

        if (!row) {
          notInBatch.push(email)
          continue
        }
        if (row.mentorId === input.mentorId) {
          alreadyTheirs.push(email)
          continue
        }
        if (row.mentorId && joinedEmails.has(email)) {
          blockedJoined.push(email)
          continue
        }

        if (row.mentorId) moved.push(email)
        assign.push(row.id)
      }

      if (assign.length > 0) {
        await ctx.prisma.student.updateMany({
          where: { id: { in: assign } },
          data: { mentorId: input.mentorId },
        })
      }

      return {
        assigned: assign.length,
        movedFromAnotherInstructor: moved.length,
        alreadyTheirs: alreadyTheirs.length,
        notInBatch,
        blockedJoined,
      }
    }),
  studentsByMentor: adminProcedure
    .input(
      z.object({
        mentorId: z.string().optional(),
        batchId: z.string().optional(),
        email: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // An email search looks across every batch; otherwise scope to the batch.
      const where = input.email
        ? { email: { contains: input.email, mode: "insensitive" as const } }
        : { batchId: input.batchId, mentorId: input.mentorId }

      return ctx.prisma.student.findMany({
        where,
        include: { user: true, mentor: { include: { user: true } } },
        orderBy: [{ userId: "desc" }, { name: "asc" }],
      })
    }),

  exportStudents: adminProcedure
    .input(
      z.object({
        type: z.enum(["joined", "notJoined"]),
        batchId: z.string(),
        mentorId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const where = {
        batchId: input.batchId,
      } as Record<string, string>

      if (input.mentorId) {
        where.mentorId = input.mentorId
      }

      const students = await ctx.prisma.student.findMany({
        where: {
          ...where,
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
