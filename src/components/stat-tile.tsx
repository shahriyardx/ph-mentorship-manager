import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Tone = "default" | "brand" | "good" | "warn"

const TONES: Record<Tone, { chip: string; value: string; rule: string }> = {
  // Neutral counts: brand-tinted icon, plain ink for the number.
  default: {
    chip: "bg-[var(--ph-brand)]/15 text-[var(--ph-brand-2)]",
    value: "text-foreground",
    rule: "from-[var(--ph-brand)] to-[var(--ph-brand-2)]",
  },
  brand: {
    chip: "bg-[var(--ph-brand)]/15 text-[var(--ph-brand-2)]",
    value: "text-foreground",
    rule: "from-[var(--ph-brand)] to-[var(--ph-brand-2)]",
  },
  good: {
    chip: "bg-emerald-500/15 text-emerald-400",
    value: "text-emerald-400",
    rule: "from-emerald-500 to-emerald-500/0",
  },
  warn: {
    chip: "bg-amber-500/15 text-amber-400",
    value: "text-amber-400",
    rule: "from-amber-500 to-amber-500/0",
  },
}

export const StatTile = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number | string
  hint?: string
  icon?: LucideIcon
  tone?: Tone
}) => {
  const t = TONES[tone]

  return (
    <div className="group bg-card relative overflow-hidden rounded-xl border p-5 transition-colors duration-300 hover:border-[var(--ph-brand)]/40">
      {/* Accent rule along the top edge. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70",
          t.rule,
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>

        {Icon && (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              t.chip,
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>

      {/* Hero number: the one thing this tile is for. */}
      <p
        className={cn(
          "mt-3 text-4xl font-semibold tabular-nums tracking-[-0.03em]",
          t.value,
        )}
      >
        {value}
      </p>

      {hint && <p className="text-muted-foreground mt-1.5 text-xs">{hint}</p>}
    </div>
  )
}

/**
 * Single-hue meter on a neutral track. The numbers are stated in text, so the
 * bar itself is decorative.
 */
export const JoinMeter = ({
  joined,
  assigned,
  className,
}: {
  joined: number
  assigned: number
  className?: string
}) => {
  const pct = assigned > 0 ? Math.round((joined / assigned) * 100) : 0
  const remaining = Math.max(assigned - joined, 0)

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {joined}
          </span>
          <span className="text-muted-foreground"> of {assigned} joined</span>
        </p>
        <p className="text-sm font-medium tabular-nums text-[var(--ph-brand-2)]">
          {pct}%
        </p>
      </div>

      <div
        aria-hidden
        className="bg-muted h-2.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-muted-foreground text-xs tabular-nums">
        {remaining} still to join
      </p>
    </div>
  )
}
