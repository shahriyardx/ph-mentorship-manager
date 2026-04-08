import { DashboardHeader } from "./dashboard-header"

export const DashboardPageWrapper = ({
  pageTitle,
  children,
}: {
  pageTitle: string
  children: React.ReactNode
}) => {
  return (
    <div>
      <DashboardHeader pageTitle={pageTitle} />
      <div className="p-4 pt-0">{children}</div>
    </div>
  )
}
