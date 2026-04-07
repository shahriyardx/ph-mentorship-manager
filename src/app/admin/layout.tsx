import { SidebarLink } from "@/components/sidebar-link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-5 gap-5">
      <aside className="col-span-1 border-r">
        <ul className="flex flex-col gap-2">
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
        </ul>
      </aside>
      <main className="col-span-4">{children}</main>
    </div>
  )
}
