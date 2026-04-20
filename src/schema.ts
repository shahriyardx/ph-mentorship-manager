import z from "zod"

export const BatchSchema = z.object({
  name: z.string().min(1, { message: "Batch name is required" }),
  discordServerId: z.string().min(1, { message: "Discord server is required" }),
})

export const MentorSchema = z.object({
  discordChannelId: z.string().min(1),
  mentorId: z.string().min(1),
})

export const AddStudentSchema = z.object({
  emails: z.string().min(1),
})

export const StudentJoinSchema = z.object({
  email: z.email(),
})

export const SettingsSchema = z.object({
  serverId: z.string().min(1),
  dashboardLogChannelId: z.string().min(1),
})

export const AddMentorSchema = z.object({
  batchId: z.string().optional(),
  mentors: z
    .array(z.string())
    .min(1, { message: "At least one mentor is required" }),
})

export const BatchSetDiscordSchema = z.object({
  batchId: z.string().min(1),
  discordServerId: z.string().min(1),
})
