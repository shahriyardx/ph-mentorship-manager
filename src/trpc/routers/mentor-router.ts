import { env } from "@/lib/env"
import {
  createTRPCRouter,
  adminOrMentorProcedure,
  protectedProcedure,
} from "../init"
import z from "zod"

export const mentorRouter = createTRPCRouter({
  applyForMentor: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    })

    if (!user || user.appliedForMentor || user.role === "mentor") return

    await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        appliedForMentor: true,
      },
    })

    await sendChannelMessage(
      "1491315142204457103",
      `${user.name} has requested to be a mentor and awaiting approval. \nVisit ${env.BETTER_AUTH_URL}/admin to assign them as mentor`,
    )
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
