import { AddMentorSchema, AddStudentSchema, BatchSchema } from "@/schema"
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
    }),
  addBatch: superadminProcedure
    .input(BatchSchema)
    .mutation(async ({ input, ctx }) => {
      const batch = await ctx.prisma.batch.create({
        data: {
          name: input.name,
          discordServerId: input.discordServerId,
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
        _count: {
          select: {
            students: true,
            students_data: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return batches
  }),
  users: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany()
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
      input.mentors.forEach(async (mentorUserId) => {
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
      })
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
    .query(async ({ ctx }) => {
      const mentors = await ctx.prisma.user.findMany({
        where: {
          role: {
            in: ["mentor", "admin", "superadmin"],
          },
        },
      })

      const addedMentor = await ctx.prisma.mentor.findMany({
        where: {
          batchId: {
            not: null,
          },
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
  deleteStudentData: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.studentsData.delete({
        where: {
          id: input.id,
        },
      })
    }),
  addStudents: adminProcedure
    .input(
      AddStudentSchema.extend({ mentorId: z.string(), batchId: z.string() }),
    )
    .mutation(async ({ input, ctx }) => {
      const studentEmails =
        input.emails.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ??
        []

      console.log(studentEmails)

      for (const email of studentEmails) {
        try {
          await ctx.prisma.studentsData.create({
            data: {
              email,
              batchId: input.batchId,
              mentorId: input.mentorId,
            },
          })
        } catch {
          // console.error(error)
        }
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
      if (input.email) {
        const assignedStudents = await ctx.prisma.studentsData.findMany({
          where: {
            email: {
              contains: input.email,
            },
          },
        })

        const joinedStudents = await ctx.prisma.student.findMany({
          where: {
            email: {
              contains: input.email,
            },
          },
          include: {
            user: true,
          },
        })
        return {
          assignedStudents: assignedStudents,
          joinedStudents: joinedStudents,
        }
      }
      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: {
          batchId: input.batchId,
          mentorId: input.mentorId,
        },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: {
          batchId: input.batchId,
          mentorId: input.mentorId,
        },
        include: {
          user: true,
        },
      })

      return { assignedStudents, joinedStudents }
    }),

  exportStudents: adminProcedure
    .input(
      z.object({
        type: z.enum(["joined", "notJoined"]),
        batchId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const assignedStudents = await ctx.prisma.studentsData.findMany({
        where: {
          batchId: input.batchId,
        },
      })

      const joinedStudents = await ctx.prisma.student.findMany({
        where: {
          batchId: input.batchId,
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
