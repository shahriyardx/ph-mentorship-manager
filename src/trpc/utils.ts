import {
  addRoleToUser,
  createChannel,
  createRole,
  getChannel,
  updateChannel,
} from "@/lib/discord"
import { requireBatchServerId } from "@/lib/settings"
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

/** Full control of their own squad channels. */
const INSTRUCTOR_PERMISSIONS =
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.ManageMessages |
  PermissionFlagsBits.ManageChannels |
  PermissionFlagsBits.ManageThreads |
  PermissionFlagsBits.MentionEveryone |
  PermissionFlagsBits.AttachFiles |
  PermissionFlagsBits.AddReactions |
  PermissionFlagsBits.EmbedLinks

/** Students in announcements: read, never post. */
const STUDENT_READ_ONLY =
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.AddReactions

/** Students in discussion: take part. */
const STUDENT_READ_WRITE =
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.AttachFiles |
  PermissionFlagsBits.AddReactions |
  PermissionFlagsBits.EmbedLinks

/**
 * Students in the help forum: they open their own posts and reply in them.
 * In a forum, creating a post is CreatePublicThreads and talking inside one is
 * SendMessagesInThreads — SendMessages alone is not enough.
 */
const STUDENT_FORUM =
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.CreatePublicThreads |
  PermissionFlagsBits.SendMessagesInThreads |
  PermissionFlagsBits.AttachFiles |
  PermissionFlagsBits.AddReactions |
  PermissionFlagsBits.EmbedLinks

/** Instructor in the help forum: everything, plus tidying posts up. */
const INSTRUCTOR_FORUM =
  INSTRUCTOR_PERMISSIONS |
  PermissionFlagsBits.CreatePublicThreads |
  PermissionFlagsBits.SendMessagesInThreads

/** Discord's green. Colour only, no separate member-list group. */
const INSTRUCTOR_ROLE_COLOR = 0x57f287

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

  const guildId = await requireBatchServerId(batchId)
  const categoryName = slugify(`${user?.name}-squad`)

  // Two roles per instructor per batch: one they hold, one their students hold.
  // The student role is left uncoloured on purpose.
  const studentRole = await createRole(guildId, {
    name: categoryName,
  })

  const instructorRole = await createRole(guildId, {
    name: slugify(`${user?.name}-mentor`),
    color: INSTRUCTOR_ROLE_COLOR,
  })

  const everyonePermission = {
    id: guildId,
    type: OverwriteType.Role,
    deny: String(
      PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages,
    ),
    allow: "0",
  }

  // Permissions follow the instructor role, not the person, so the channels
  // keep working if their Discord account changes or a second lead is added.
  const instructorPermission = {
    id: instructorRole.id,
    type: OverwriteType.Role,
    allow: String(INSTRUCTOR_PERMISSIONS),
  }

  const studentReadOnly = {
    id: studentRole.id,
    type: OverwriteType.Role,
    allow: String(STUDENT_READ_ONLY),
  }

  const studentReadWrite = {
    id: studentRole.id,
    type: OverwriteType.Role,
    allow: String(STUDENT_READ_WRITE),
  }

  const studentForum = {
    id: studentRole.id,
    type: OverwriteType.Role,
    allow: String(STUDENT_FORUM),
  }

  const instructorForumPermission = {
    id: instructorRole.id,
    type: OverwriteType.Role,
    allow: String(INSTRUCTOR_FORUM),
  }

  const category = await createChannel(guildId, {
    name: categoryName,
    type: ChannelType.GuildCategory,
    permission_overwrites: [everyonePermission, instructorPermission],
  })

  const announcements = await createChannel(guildId, {
    name: "announcements",
    type: ChannelType.GuildText,
    parent_id: category.id,
    permission_overwrites: [
      everyonePermission,
      instructorPermission,
      studentReadOnly,
    ],
  })

  // A forum so each question becomes its own post instead of scrolling away.
  const help = await createChannel(guildId, {
    name: "help",
    type: ChannelType.GuildForum,
    parent_id: category.id,
    topic: "Open a post for each question. Your mentor answers in the thread.",
    permission_overwrites: [
      everyonePermission,
      instructorForumPermission,
      studentForum,
    ],
  })

  const resources = await createChannel(guildId, {
    name: "resources",
    type: ChannelType.GuildText,
    parent_id: category.id,
    topic: "Links, notes and material your mentor shares.",
    permission_overwrites: [
      everyonePermission,
      instructorPermission,
      studentReadOnly,
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
          instructorPermission,
          studentReadWrite,
        ],
      })
    } else {
      discussions = await createChannel(guildId, {
        name: "discussion",
        type: ChannelType.GuildText,
        parent_id: category.id,
        permission_overwrites: [
          everyonePermission,
          instructorPermission,
          studentReadWrite,
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
        helpChannelId: help.id,
        resourceChannelId: resources.id,
        roleId: studentRole.id,
        mentorRoleId: instructorRole.id,
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
        instructorPermission,
        studentReadWrite,
      ],
    })

    await prisma.mentor.create({
      data: {
        userId: userId,
        batchId,
        categoryId: category.id,
        announcementChannelId: announcements.id,
        discussionChannelId: discussions.id,
        helpChannelId: help.id,
        resourceChannelId: resources.id,
        roleId: studentRole.id,
        mentorRoleId: instructorRole.id,
        discordChannelId: "",
      },
    })
  }

  // Hand the instructor their role. Without this they cannot see the channels.
  if (userDiscordId) {
    try {
      await addRoleToUser(guildId, userDiscordId, instructorRole.id)
    } catch (error) {
      console.error("Failed to give the instructor their Discord role", error)
    }
  }
}

const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
