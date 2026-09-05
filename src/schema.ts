import z from "zod"

export const BatchSchema = z.object({
  name: z.string().min(1, { message: "Batch name is required" }),
  // Optional: blank means the batch uses the server set in Settings.
  discordServerId: z.string().optional(),
})

export const MentorSchema = z.object({
  discordChannelId: z.string().min(1),
  mentorId: z.string().min(1),
})

export const AddStudentSchema = z.object({
  file: z.string().min(1, { message: "An Excel file is required" }),
  filename: z.string().min(1),
})

export const AssignStudentsSchema = z.object({
  emails: z.string().min(1, { message: "Paste at least one email" }),
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

export const BatchUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, { message: "Batch name is required" }),
  // Blank means the batch falls back to the server set in Settings.
  discordServerId: z.string().optional(),
})
