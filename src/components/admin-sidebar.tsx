import { SidebarLink } from "./sidebar-link"

export const AdminSidebar = () => {
  return (
    <ul className="flex md:flex-col flex-wrap gap-2">
      <li>
        <SidebarLink href="/admin">Dashboard</SidebarLink>
      </li>
      <li>
        <SidebarLink href="/admin/batches">Batches</SidebarLink>
      </li>
      <li>
        <SidebarLink href="/admin/mentors">Mentors</SidebarLink>
      </li>
      <li>
        <SidebarLink href="/admin/students">Students</SidebarLink>
      </li>
      <li>
        <SidebarLink href="/admin/users">Users</SidebarLink>
      </li>
      <li>
        <SidebarLink href="/admin/settings">Settings</SidebarLink>
      </li>
    </ul>
  )
}
