import { REST } from "@discordjs/rest"
import { env } from "./env"
import {
  Routes,
  ChannelType,
  type APIChannel,
  type RESTPatchAPIChannelJSONBody,
  type RESTPostAPIGuildChannelJSONBody,
  type RESTPostAPIGuildChannelResult,
  type APIPartialGuild,
  type RESTPostAPIGuildRoleJSONBody,
  type APIRole,
} from "discord-api-types/v10"

export const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN)

export const getTextChannels = async (guild_id: string) => {
  const channels = (await rest.get(
    Routes.guildChannels(guild_id),
  )) as APIChannel[]

  return channels.filter((c) => c.type === ChannelType.GuildText)
}

export const getChannel = async (channel_id: string) => {
  try {
    const channel = await rest.get(Routes.channel(channel_id))
    return channel as APIChannel
  } catch {
    return null
  }
}

export const createRole = async (
  guild_id: string,
  body: RESTPostAPIGuildRoleJSONBody,
) => {
  const role = await rest.post(Routes.guildRoles(guild_id), {
    body,
  })
  return role as APIRole
}

export const getServers = async () => {
  const servers = (await rest.get(Routes.userGuilds())) as APIPartialGuild[]
  return servers
}

export const getServer = async (guild_id: string) => {
  const server = (await rest.get(Routes.guild(guild_id))) as APIPartialGuild
  return server
}

export const createChannel = async (
  guild_id: string,
  body: RESTPostAPIGuildChannelJSONBody,
) => {
  const cat = await rest.post(Routes.guildChannels(guild_id), {
    body,
  })

  return cat as RESTPostAPIGuildChannelResult
}

export const updateChannel = async (
  channel_id: string,
  body: RESTPatchAPIChannelJSONBody,
) => {
  return await rest.patch(Routes.channel(channel_id), {
    body,
  })
}

export const deleteChannel = async (channel_id: string) => {
  return await rest.delete(Routes.channel(channel_id))
}

export const addUserToGuild = async (
  guild_id: string,
  user_id: string,
  access_token: string,
) => {
  return await rest.put(Routes.guildMember(guild_id, user_id), {
    body: {
      access_token,
    },
  })
}

export const addRoleToUser = async (
  guild_id: string,
  user_id: string,
  role_id: string,
) => {
  return await rest.put(Routes.guildMemberRole(guild_id, user_id, role_id))
}
