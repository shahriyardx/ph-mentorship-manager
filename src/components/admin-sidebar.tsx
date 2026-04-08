import { SidebarLink } from "./sidebar-link"

export const AdminSidebar = () => {
  return (
    <div className="flex md:flex-col flex-wrap gap-1">
      <SidebarLink href="/admin">Dashboard</SidebarLink>
      <SidebarLink href="/admin/batches">Batches</SidebarLink>
      <SidebarLink href="/admin/mentors">Mentors</SidebarLink>
      <SidebarLink href="/admin/students">Students</SidebarLink>
      <SidebarLink href="/admin/users">Users</SidebarLink>
      <SidebarLink href="/admin/settings">Settings</SidebarLink>
    </div>
  )
}
