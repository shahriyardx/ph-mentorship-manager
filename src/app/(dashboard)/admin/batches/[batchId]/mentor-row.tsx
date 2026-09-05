"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import type { inferRouterOutputs } from "@trpc/server"
import type { appRouter } from "@/trpc/routers/_app"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

type Mentor = inferRouterOutputs<typeof appRouter>["batch"]["mentors"][number]

const MentorRow = ({ mentor }: { mentor: Mentor }) => {
  const assigned = mentor._count.students
  const joined = mentor.joined
  const pct = assigned > 0 ? Math.round((joined / assigned) * 100) : 0

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarImage
              src={mentor.user.image ?? undefined}
              alt={mentor.user.name}
            />
            <AvatarFallback className="text-xs">
              {mentor.user.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <Link
              href={`/admin/instructors/${mentor.id}`}
              className="block truncate font-medium hover:underline"
            >
              {mentor.user.name}
            </Link>
            <span className="text-muted-foreground block truncate text-xs">
              {mentor.user.email}
            </span>
          </div>
        </div>

        <div className="mt-2 flex max-w-48 items-center gap-2">
          <span
            aria-hidden
            className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)]"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {pct}%
          </span>
        </div>
      </TableCell>

      <TableCell className="text-right tabular-nums">{assigned}</TableCell>
      <TableCell className="text-right tabular-nums text-emerald-400">
        {joined}
      </TableCell>

      <TableCell>
        {/* Assign, export and re-sync all live on the instructor page. */}
        <div className="flex justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/instructors/${mentor.id}`}>
              Manage
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default MentorRow
