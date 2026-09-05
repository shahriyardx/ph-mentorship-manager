import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

/**
 * Shown instead of an empty table or list. Always says what to do next, so a
 * blank screen never leaves someone stuck.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      <span className="bg-muted text-muted-foreground grid size-11 place-items-center rounded-xl">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>

      <p className="mt-4 font-medium">{title}</p>

      {description && (
        <p className="text-muted-foreground mt-1.5 max-w-[46ch] text-sm">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
