"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const page = () => {
  const { data: settings, refetch } = trpc.admin.settings.useQuery()
  const { data: servers } = trpc.discord.getServers.useQuery()

  const { mutate: toggleMaintenanceMode } =
    trpc.admin.toggleMaintenanceMode.useMutation({
      onSuccess: () => {
        refetch()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const { mutate: setDiscordServer, isPending: isSavingServer } =
    trpc.admin.setDiscordServer.useMutation({
      onSuccess: () => {
        toast.success("Discord server updated")
        refetch()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  return (
    <DashboardPageWrapper pageTitle="Settings">
      <div className="space-y-5">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Discord Server</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={settings?.serverId || undefined}
              onValueChange={(serverId) => setDiscordServer({ serverId })}
              disabled={isSavingServer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {servers?.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              Every batch uses this server. Students are added here when they
              join, and mentor channels are created here.
            </p>

            {!settings?.serverId && (
              <p className="text-sm text-destructive">
                No server set yet. Students cannot join until you pick one.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Label>Maintenance Mode</Label>
              <Switch
                checked={settings?.maintenanceMode}
                onCheckedChange={() => toggleMaintenanceMode()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
