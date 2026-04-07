import z from "zod"

export const BatchSchema = z.object({
  name: z.string().min(1, { message: "Batch name is required" }),
})

export const MentorSchema = z.object({
  discordChannelId: z.string().min(1),
  mentorId: z.string().min(1),
})
