import {
  AddStudentSchema,
  BatchSchema,
  MentorSchema,
  SettingsSchema,
} from "@/schema"
import {
  adminOrMentorProcedure,
  adminProcedure,
  createTRPCRouter,
} from "../init"
import z from "zod"

export const adminRouter = createTRPCRouter({
  settings: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.settings.findFirst()
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
    .input(MentorSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.mentorId,
        },
      })
      if (!user) {
        throw new Error("User not found")
      }

      const mentor = await ctx.prisma.mentor.findUnique({
        where: {
          userId: input.mentorId,
        },
      })
      if (mentor) {
        throw new Error("Mentor already exists")
      }

      await ctx.prisma.mentor.create({
        data: {
          discordChannelId: input.discordChannelId,
          userId: input.mentorId,
        },
      })

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          appliedForMentor: false,
          role: user.role === "user" ? "mentor" : user.role,
        },
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
    const settings = await ctx.prisma.settings.findFirst()
    const batchId = settings ? settings.currentBatchId : ""

    const mentors = await ctx.prisma.mentor.findMany({
      include: {
        user: true,
        _count: {
          select: {
            studentsDatas: {
              where: {
                batchId: batchId,
              },
            },
            students: {
              where: {
                batchId: batchId,
              },
            },
          },
        },
      },
    })

    const mentorWithUser = mentors.map((mentor) => ({
      ...mentor,
      name: mentor.user.name,
      email: mentor.user.email,
    }))
    return mentorWithUser
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
})
