"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { JoinMeter, StatTile } from "@/components/stat-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  MessagesSquare,
  UserRoundX,
  UsersRound,
} from "lucide-react"
import Link from "next/link"

const page = () => {
  const { data, isLoading } = trpc.mentor.overview.useQuery()

  if (isLoading) {
    return (
      <DashboardPageWrapper
        pageTitle="Overview"
        description="Your squads at a glance."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </DashboardPageWrapper>
    )
  }

  if (!data) {
    return (
      <DashboardPageWrapper
        pageTitle="Overview"
        description="Your squads at a glance."
      >
        <EmptyState
          icon={UserRoundX}
          title="No instructor profile yet"
          description="An admin needs to add you to a batch. Your Discord channels are created at the same time."
        />
      </DashboardPageWrapper>
    )
  }

  const { batches, totals } = data
  const notJoined = Math.max(totals.assigned - totals.joined, 0)

  return (
    <DashboardPageWrapper
      pageTitle="Overview"
      description={
        batches.length === 1
          ? `Your squad in ${batches[0].batch?.name ?? "your batch"}.`
          : `Your squads across ${batches.length} batches.`
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Assigned to you"
            value={totals.assigned}
            hint={
              batches.length === 1
                ? "On your list, joined or not"
                : `Across ${batches.length} batches`
            }
            icon={UsersRound}
          />
          <StatTile
            label="Joined"
            value={totals.joined}
            hint="In your Discord channels"
            icon={GraduationCap}
            tone="good"
          />
          <StatTile
            label="Yet to join"
            value={notJoined}
            hint="Worth a nudge"
            icon={UserRoundX}
            tone={notJoined > 0 ? "warn" : "good"}
          />
        </div>

        {/* One card per batch this instructor runs. */}
        <div className="grid gap-4 lg:grid-cols-2">
          {batches.map((entry) => {
            const channels = [
              {
                id: entry.announcementChannelId,
                label: "Announcements",
                icon: Megaphone,
              },
              {
                id: entry.discussionChannelId,
                label: "Discussion",
                icon: MessagesSquare,
              },
              { id: entry.helpChannelId, label: "Help", icon: LifeBuoy },
              {
                id: entry.resourceChannelId,
                label: "Resources",
                icon: BookOpen,
              },
            ].filter((channel) => channel.id && entry.serverId)

            return (
              <div
                key={entry.mentorId}
                className="bg-card rounded-xl border p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xl font-semibold tracking-tight">
                    {entry.batch?.name ?? "No batch"}
                  </p>

                  {entry.batch?.isCurrent && (
                    <Badge className="border-[var(--ph-brand)]/40 bg-[var(--ph-brand)]/15 text-[var(--ph-brand-2)]">
                      Current
                    </Badge>
                  )}
                </div>

                <JoinMeter
                  className="mt-6"
                  joined={entry.joined}
                  assigned={entry.assigned}
                />

                {channels.length > 0 && (
                  <div className="mt-6 grid gap-2">
                    {channels.map((channel) => (
                      <Link
                        key={channel.label}
                        href={`https://discord.com/channels/${entry.serverId}/${channel.id}`}
                        target="_blank"
                        className="group hover:bg-muted/60 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <channel.icon
                          className="text-muted-foreground size-4"
                          strokeWidth={1.75}
                        />
                        <span className="flex-1 text-sm font-medium">
                          {channel.label}
                        </span>
                        <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                )}

                {entry.batch && (
                  <Button variant="outline" asChild className="mt-4 w-full">
                    <Link href={`/mentor/students/${entry.batch.id}`}>
                      View students
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
