export type Role = {
  id: string
  name: string
  color: string
  position: number
  managed: boolean
}

export type Channel = {
  id: string
  name: string
  type: string
  parent_id?: string
  sub_channels: Array<Channel>
}

export type Server = {
  id: string
  name: string
}
