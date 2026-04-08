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
import { env } from "@/lib/env"

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
  removeAdmin: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
          role: { in: ["admin"] },
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

      const account = await ctx.prisma.account.findFirst({
        where: {
          userId: input.mentorId,
        },
      })

      if (account) {
        await sendDiscordDM(
          account.accountId,
          `Your mentorship application has been approved. Go to ${env.BETTER_AUTH_URL}/mentor to access your dashboard`,
        )
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
