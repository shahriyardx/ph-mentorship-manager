import { BatchSchema, MentorSchema } from "@/schema"
import { adminProcedure, createTRPCRouter } from "../init"

export const adminRouter = createTRPCRouter({
  addBatch: adminProcedure
    .input(BatchSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.batch.create({
        data: {
          name: input.name,
        },
      })
    }),

  batches: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.batch.findMany({
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })
  }),
  users: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany()
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
    }),
  mentors: adminProcedure.query(async ({ ctx }) => {
    const mentors = await ctx.prisma.mentor.findMany({
      include: { user: true },
    })
    const mentorWithUser = mentors.map((mentor) => ({
      ...mentor,
      name: mentor.user.name,
      email: mentor.user.email,
    }))
    return mentorWithUser
  }),
})
