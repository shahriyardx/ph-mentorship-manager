"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const page = () => {
  const { data: settings, refetch } = trpc.admin.settings.useQuery()
  const { mutate: toggleMaintenanceMode } =
    trpc.admin.toggleMaintenanceMode.useMutation({
      onSuccess: () => {
        refetch()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  return (
    <DashboardPageWrapper pageTitle="Settings">
      <div>
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
