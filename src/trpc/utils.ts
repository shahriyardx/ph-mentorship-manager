import {
  createChannel,
  createRole,
  getChannel,
  updateChannel,
} from "@/lib/discord"
import { prisma } from "@/lib/prisma"
import {
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
  type APIChannel,
} from "discord-api-types/v10"

type CreateMentorChannelsInput = {
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
}: CreateMentorChannelsInput) => {
  const mentor = await prisma.mentor.findFirst({
    where: {
      userId: userId,
      batchId: batchId,
    },
  })
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (mentor) return mentor

  const mentorWithoutBatch = await prisma.mentor.findFirst({
    where: {
      userId: userId,
      batchId: null,
    },
  })

  const userDiscordId = await getUserDiscordId(userId)
  const batch = await prisma.batch.findFirst({
    where: {
      id: batchId,
    },
  })
  if (!batch) return

  const guildId = batch.discordServerId as string
  const categoryName = slugify(`${user?.name}-squad`)

  const role = await createRole(guildId, {
    name: categoryName,
  })

  const everyonePermission = {
    id: guildId,
    type: OverwriteType.Role,
    deny: String(
      PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages,
    ),
    allow: "0",
  }

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
  }

  const rolePermissionViewOnly = {
    id: role.id,
    type: OverwriteType.Role,
    allow: String(PermissionFlagsBits.ViewChannel),
  }

  const rolePermissionViewAndSend = {
    id: role.id,
    type: OverwriteType.Role,
    allow: String(
      PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages,
    ),
  }

  const category = await createChannel(guildId, {
    name: categoryName,
    type: ChannelType.GuildCategory,
    permission_overwrites: [everyonePermission, mentorPermission],
  })

  const announcements = await createChannel(guildId, {
    name: "announcements",
    type: ChannelType.GuildText,
    parent_id: category.id,
    permission_overwrites: [
      everyonePermission,
      mentorPermission,
      rolePermissionViewOnly,
    ],
  })

  let discussions: APIChannel | null

  if (mentorWithoutBatch) {
    discussions = await getChannel(mentorWithoutBatch.discordChannelId)

    if (discussions) {
      await updateChannel(discussions.id, {
        name: "discussion",
        parent_id: category.id,
        permission_overwrites: [
          everyonePermission,
          mentorPermission,
          rolePermissionViewAndSend,
        ],
      })
    } else {
      discussions = await createChannel(guildId, {
        name: "discussion",
        type: ChannelType.GuildText,
        parent_id: category.id,
        permission_overwrites: [
          everyonePermission,
          mentorPermission,
          rolePermissionViewAndSend,
        ],
      })
    }

    await prisma.mentor.update({
      where: {
        id: mentorWithoutBatch.id,
      },
      data: {
        batchId,
        categoryId: category.id,
        announcementChannelId: announcements.id,
        discussionChannelId: discussions.id,
        roleId: role.id,
        discordChannelId: "",
      },
    })
  } else {
    discussions = await createChannel(guildId, {
      name: "discussion",
      type: ChannelType.GuildText,
      parent_id: category.id,
      permission_overwrites: [
        everyonePermission,
        mentorPermission,
        rolePermissionViewAndSend,
      ],
    })

    await prisma.mentor.create({
      data: {
        userId: userId,
        batchId,
        categoryId: category.id,
        announcementChannelId: announcements.id,
        discussionChannelId: discussions.id,
        roleId: role.id,
        discordChannelId: "",
      },
    })
  }
}

const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
