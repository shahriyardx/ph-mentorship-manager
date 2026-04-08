export const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <aside className="col-span-1 border-b-2 pb-5 md:border-r md:border-b-0 md:pb-0 pr-0 md:pr-5">
      {children}
    </aside>
  )
}
