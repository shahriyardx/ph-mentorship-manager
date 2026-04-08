import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>{children}</DashboardLayout>
  )
}
