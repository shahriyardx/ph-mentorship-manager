import { SidebarWrapper } from "./sidebar-wrapper"

export const DashboardLayout = ({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      <SidebarWrapper>{sidebar}</SidebarWrapper>
      <main className="md:col-span-4">{children}</main>
    </div>
  )
}
