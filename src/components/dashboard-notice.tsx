import { cn } from "@/lib/utils"
import { AlertTriangle, Info } from "lucide-react"
import Link from "next/link"

/**
 * A single thing the admin or mentor should act on. Icon + label carry the
 * meaning, so nothing depends on colour alone.
 */
export const DashboardNotice = ({
  children,
  tone = "warn",
  action,
  className,
}: {
  children: React.ReactNode
  tone?: "warn" | "info"
  action?: { href: string; label: string }
  className?: string
}) => {
  const Icon = tone === "warn" ? AlertTriangle : Info

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3",
        tone === "warn"
          ? "border-amber-500/30 bg-amber-500/8"
          : "border-[var(--ph-brand)]/30 bg-[var(--ph-brand)]/8",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          tone === "warn" ? "text-amber-400" : "text-[var(--ph-brand-2)]",
        )}
        strokeWidth={1.75}
      />

      <span className="min-w-0 flex-1 text-sm">{children}</span>

      {action && (
        <Link
          href={action.href}
          className={cn(
            "shrink-0 text-sm font-medium underline-offset-4 hover:underline",
            tone === "warn" ? "text-amber-400" : "text-[var(--ph-brand-2)]",
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
