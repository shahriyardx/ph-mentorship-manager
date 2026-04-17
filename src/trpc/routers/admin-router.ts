import {
  AddMentorSchema,
  AddStudentSchema,
  BatchSchema,
  SettingsSchema,
} from "@/schema"
import {
  adminOrMentorProcedure,
  adminProcedure,
  createTRPCRouter,
} from "../init"
import z from "zod"
import { env } from "@/lib/env"
import ExcelJS from "exceljs"
import { createMentor } from "../utils"
import { TRPCError } from "@trpc/server"

export const adminRouter = createTRPCRouter({
  settings: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.settings.findFirst()
  }),
  makeAdmin: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
          role: { in: ["user", "mentor"] },
        },
        data: {
          role: "admin",
        },
      })
    }),
  makeMentor: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
          role: { in: ["user"] },
        },
        data: {
          role: "mentor",
        },
      })
    }),
  makeUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
          role: { notIn: ["superadmin"] },
        },
        data: {
          role: "user",
        },
      })
    }),
  updateSettings: adminProcedure
    .input(SettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const settings = await ctx.prisma.settings.findFirst()
      if (!settings) {
        await ctx.prisma.settings.create({
          data: {
            serverId: input.serverId,
            dashboardLogChannelId: input.dashboardLogChannelId,
            currentBatchId: "",
          },
        })
      } else {
        await ctx.prisma.settings.update({
          where: {
            id: settings.id,
          },
          data: {
            serverId: input.serverId,
            dashboardLogChannelId: input.dashboardLogChannelId,
          },
        })
      }
    }),
  addBatch: adminProcedure
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
  setCurrentBatch: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const settings = await ctx.prisma.settings.findFirst()
      if (!settings) {
        await ctx.prisma.settings.create({
          data: {
            currentBatchId: input.id,
          },
        })
      } else {
        await ctx.prisma.settings.update({
          where: {
            id: settings.id,
          },
          data: {
            currentBatchId: input.id,
          },
        })
      }
    }),
  deleteBatch: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.delete({
        where: {
          id: input.id,
        },
      })
    }),
  batches: adminOrMentorProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findFirst()
    const currentBatchId = settings?.currentBatchId

    const batches = await ctx.prisma.batch.findMany({
      include: {
        _count: {
          select: {
            students: true,
            students_data: true,
          },
        },
      },
    })

    return batches.map((batch) => ({
      ...batch,
      isCurrent: batch.id === currentBatchId,
    }))
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
          categoryName: `${user.name.trim().replaceAll(" ", "-")}-squad`,
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
    .input(AddStudentSchema.extend({ mentorId: z.string() }))
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

async function sendDiscordDM(userId: string, message: string) {
  const headers = {
    Authorization: `Bot ${env.DISCORD_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "ProgrammingHero (https://programming-hero.com, 1.0)",
  }

  // Step 1: Create a DM channel with the user
  const dmChannelResponse = await fetch(
    "https://discord.com/api/v10/users/@me/channels",
    {
      method: "POST",
      headers,
      body: JSON.stringify({ recipient_id: userId }),
    },
  )

  if (!dmChannelResponse.ok) {
    const error = await dmChannelResponse.json()
    throw new Error(
      `Failed to create DM channel: ${error.message || dmChannelResponse.statusText}`,
    )
  }

  const dmChannel = await dmChannelResponse.json()

  // Step 2: Send the message to the newly created DM channel
  const messageResponse = await fetch(
    `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ content: message }),
    },
  )

  if (!messageResponse.ok) {
    const error = await messageResponse.json()
    throw new Error(
      `Failed to send message: ${error.message || messageResponse.statusText}`,
    )
  }

  return await messageResponse.json()
}
