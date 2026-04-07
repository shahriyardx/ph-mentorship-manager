import Header from "@/components/header"
import { SidebarLink } from "@/components/sidebar-link"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Header />
      <Separator className="my-5" />
      <div className="grid grid-cols-5 gap-5">
        <aside className="col-span-1 border-r">
          <ul className="flex flex-col gap-2">
            <li>
              <SidebarLink href="/mentor">Dashboard</SidebarLink>
            </li>
            <li>
              <SidebarLink href="/mentor/students">Students</SidebarLink>
            </li>
          </ul>
        </aside>
        <main className="col-span-4">{children}</main>
      </div>
    </div>
  )
}
