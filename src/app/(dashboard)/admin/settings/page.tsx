"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"

const page = () => {
  const { data: settings, refetch } = trpc.admin.settings.useQuery()
  const { mutate: toggleMaintenanceMode } =
    trpc.admin.toggleMaintenanceMode.useMutation({
      onSuccess: () => {
        refetch()
      },
    })
  return (
    <DashboardPageWrapper pageTitle="Settings">
      <div>
        <Button onClick={() => toggleMaintenanceMode()}>
          {settings?.maintenanceMode
            ? "Disable Maintenance Mode"
            : "Enable Maintenance Mode"}
        </Button>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
