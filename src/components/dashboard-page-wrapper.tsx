import { DashboardHeader } from "./dashboard-header"

export const DashboardPageWrapper = ({
  pageTitle,
  description,
  actions,
  children,
}: {
  pageTitle: string
  /** One line saying what this page is for. */
  description?: string
  /** Primary controls for the page, shown top right. */
  actions?: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div className="flex min-h-svh flex-col">
      <DashboardHeader pageTitle={pageTitle} />

      <div className="border-b px-4 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              {pageTitle}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}
