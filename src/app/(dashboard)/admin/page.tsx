"use client"

import { DashboardNotice } from "@/components/dashboard-notice"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { JoinMeter, StatTile } from "@/components/stat-tile"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"
import {
  ArrowRight,
  GraduationCap,
  Settings2,
  TablePropertiesIcon,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react"
import Link from "next/link"

const JUMP_LINKS = [
  {
    href: "/admin/batches",
    label: "Batches",
    hint: "Create batches, add mentors, set the current one",
    icon: TablePropertiesIcon,
  },
  {
    href: "/admin/instructors",
    label: "Instructors",
    hint: "Per-mentor students, imports and exports",
    icon: UserRound,
  },
  {
    href: "/admin/students",
    label: "Students",
    hint: "Search everyone, see who has joined",
    icon: UsersRound,
  },
  {
    href: "/admin/users",
    label: "Users and roles",
    hint: "Grant admin or mentor access",
    icon: Users,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    hint: "Discord server and maintenance mode",
    icon: Settings2,
  },
]

const page = () => {
  const { data, isLoading } = trpc.admin.overview.useQuery()

  if (isLoading || !data) {
    return (
      <DashboardPageWrapper
        pageTitle="Overview"
        description="How the mentorship program is doing right now."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </DashboardPageWrapper>
    )
  }

  const notJoined = Math.max(data.assigned - data.joined, 0)

  // Everything an admin should act on, most blocking first.
  const notices = [
    !data.hasDiscordServer && {
      text: "No Discord server is set. Students cannot join until you pick one.",
      action: { href: "/admin/settings", label: "Open Settings" },
    },
    !data.currentBatch && {
      text: "No batch is marked as current, so students have nothing to join.",
      action: { href: "/admin/batches", label: "Open Batches" },
    },
    data.maintenanceMode && {
      text: "Maintenance mode is on. The public site is closed to students.",
      action: { href: "/admin/settings", label: "Turn it off" },
    },
    data.unassigned > 0 && {
      text: `${data.unassigned} imported student${data.unassigned === 1 ? " has" : "s have"} no instructor yet, so they cannot join.`,
      action: data.currentBatch
        ? {
            href: `/admin/batches/${data.currentBatch.id}`,
            label: "Assign them",
          }
        : undefined,
    },
    data.mentorsWithoutBatch > 0 && {
      text: `${data.mentorsWithoutBatch} mentor${data.mentorsWithoutBatch === 1 ? " is" : "s are"} not assigned to any batch.`,
      action: { href: "/admin/batches", label: "Assign them" },
    },
    data.pendingMentorRequests > 0 && {
      text: `${data.pendingMentorRequests} user${data.pendingMentorRequests === 1 ? "" : "s"} applied to be a mentor.`,
      action: { href: "/admin/users", label: "Review" },
    },
  ].filter(Boolean) as {
    text: string
    action?: { href: string; label: string }
  }[]

  return (
    <DashboardPageWrapper
      pageTitle="Overview"
      description="How the mentorship program is doing right now."
      actions={
        <Button asChild>
          <Link href="/admin/batches">
            Manage batches
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {notices.length > 0 && (
          <div className="space-y-2">
            {notices.map((notice) => (
              <DashboardNotice key={notice.text} action={notice.action}>
                {notice.text}
              </DashboardNotice>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Batches"
            value={data.batches}
            hint={
              data.currentBatch
                ? `Current: ${data.currentBatch.name}`
                : "None set as current"
            }
            icon={TablePropertiesIcon}
            tone="brand"
          />
          <StatTile
            label="Mentors"
            value={data.mentors}
            hint={`${data.users} accounts in total`}
            icon={UserRound}
          />
          <StatTile
            label="Students joined"
            value={data.joined}
            hint="In their Discord channels"
            icon={GraduationCap}
            tone="good"
          />
          <StatTile
            label="Yet to join"
            value={notJoined}
            hint={`${data.assigned} assigned in total`}
            icon={UsersRound}
            tone={notJoined > 0 ? "warn" : "good"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="bg-card rounded-xl border p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Current batch
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight">
                  {data.currentBatch?.name ?? "None"}
                </p>
              </div>

              {data.currentBatch && (
                <p className="text-muted-foreground text-sm tabular-nums">
                  {data.currentBatch.mentors} mentor
                  {data.currentBatch.mentors === 1 ? "" : "s"}
                </p>
              )}
            </div>

            {data.currentBatch ? (
              <>
                <JoinMeter
                  className="mt-6"
                  joined={data.currentBatch.joined}
                  assigned={data.currentBatch.assigned}
                />

                <Button variant="outline" asChild className="mt-6 w-full">
                  <Link href={`/admin/batches/${data.currentBatch.id}`}>
                    Open batch
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mt-4 text-sm">
                  Mark a batch as current so students can join it.
                </p>
                <Button variant="outline" asChild className="mt-6 w-full">
                  <Link href="/admin/batches">
                    Go to batches
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="bg-card rounded-xl border p-2 lg:col-span-3">
            {JUMP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group hover:bg-muted/60 flex items-center gap-4 rounded-lg p-4 transition-colors"
              >
                <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg transition-colors group-hover:bg-[var(--ph-brand)]/15 group-hover:text-[var(--ph-brand-2)]">
                  <link.icon className="size-4" strokeWidth={1.75} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {link.label}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {link.hint}
                  </span>
                </span>

                <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
