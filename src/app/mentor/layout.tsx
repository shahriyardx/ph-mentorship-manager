"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MentorSidebar } from "@/components/mentor-sidebar"

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout sidebar={<MentorSidebar />}>{children}</DashboardLayout>
  )
}
