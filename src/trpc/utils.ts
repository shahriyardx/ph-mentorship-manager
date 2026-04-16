import { createChannel } from "@/lib/discord"
import { prisma } from "@/lib/prisma"
import {
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
  type APIOverwrite,
} from "discord-api-types/v10"

type CreateMentorChannelsInput = {
  guildId: string
  categoryName: string
  userId: string
  batchId: string
}

export const getUserDiscordId = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      accounts: true,
    },
  })

  const discordId = user?.accounts[0]?.accountId
  return discordId || ""
}

export const createMentor = async ({
  userId,
  batchId,
  categoryName,
}: CreateMentorChannelsInput) => {
  const mentor = await prisma.mentor.findFirst({
    where: {
      userId: userId,
      batchId: batchId,
    },
  })

  if (mentor) return mentor

  const userDiscordId = await getUserDiscordId(userId)
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
    },
  })
  if (!batch) return

  const guildId = batch.discordServerId as string

  const everyonePermission = {
    id: guildId,
    type: OverwriteType.Role,
    deny: String(
      PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages,
    ),
    allow: "0",
  } as APIOverwrite

  const mentorPermission = {
    id: userDiscordId,
    type: OverwriteType.Member,
    allow: String(
      PermissionFlagsBits.ViewChannel |
        PermissionFlagsBits.SendMessages |
        PermissionFlagsBits.ManageMessages |
        PermissionFlagsBits.ManageChannels |
        PermissionFlagsBits.AttachFiles |
        PermissionFlagsBits.AddReactions |
        PermissionFlagsBits.EmbedLinks,
    ),
  } as APIOverwrite

  const category = await createChannel(guildId, {
    name: categoryName,
    type: ChannelType.GuildCategory,
    permission_overwrites: [everyonePermission],
  })

  const announcements = await createChannel(guildId, {
    name: "announcements",
    type: ChannelType.GuildText,
    parent_id: category.id,
    permission_overwrites: [everyonePermission, mentorPermission],
  })

  const discussions = await createChannel(guildId, {
    name: "discussions",
    type: ChannelType.GuildText,
    parent_id: category.id,
    permission_overwrites: [everyonePermission, mentorPermission],
  })

  await prisma.mentor.create({
    data: {
      userId: userId,
      batchId,
      categoryId: category.id,
      announcementChannelId: announcements.id,
      discussionChannelId: discussions.id,
      discordChannelId: "",
    },
  })
}
