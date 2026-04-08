import z from "zod"

export const BatchSchema = z.object({
  name: z.string().min(1, { message: "Batch name is required" }),
})

export const MentorSchema = z.object({
  discordChannelId: z.string().min(1),
  mentorId: z.string().min(1),
})

export const AddStudentSchema = z.object({
  batchId: z.string().min(1),
  emails: z.string().min(1),
})

export const StudentJoinSchema = z.object({
  email: z.email(),
})

export const SettingsSchema = z.object({
  serverId: z.string().min(1),
  dashboardLogChannelId: z.string().min(1),
})
