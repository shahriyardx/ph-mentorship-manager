"use client"

import { DashboardNotice } from "@/components/dashboard-notice"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { JoinMeter, StatTile } from "@/components/stat-tile"
import { StudentTable } from "@/components/student-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc, trpcVanilla } from "@/trpc/client"
import {
  ArrowLeft,
  BookOpen,
  Download,
  GraduationCap,
  LifeBuoy,
  Loader2,
  Megaphone,
  MessagesSquare,
  Search,
  ShieldCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { AssignStudentsDialog } from "../../batches/[batchId]/assign-students-dialog"

const page = () => {
  const params = useParams()
  const mentorId = params.mentorId as string
  const [search, setSearch] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ migrated: 0, total: 0 })

  const { data, isPending, refetch } = trpc.admin.instructorDetail.useQuery({
    mentorId,
  })

  const { mutate: exportStudents, isPending: isExporting } =
    trpc.admin.exportStudents.useMutation({
      onSuccess: (file) => {
        const link = document.createElement("a")
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${file.base64}`
        link.download = file.filename
        link.click()
        link.remove()
        toast.success("Export downloaded")
      },
      onError: (error) => toast.error(error.message),
    })

  /** Re-applies every student's Discord role. Idempotent, so safe to repeat. */
  const handleResync = async (batchId: string, mentorId: string) => {
    setIsSyncing(true)
    try {
      const stream = await trpcVanilla.batch.migrateStudents.mutate({
        batchId,
        mentorId,
      })
      for await (const update of stream) {
        setSyncProgress(update)
      }
      toast.success("Discord roles re-applied")
      refetch()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not re-sync roles",
      )
    } finally {
      setIsSyncing(false)
    }
  }

  if (isPending || !data) {
    return (
      <DashboardPageWrapper pageTitle="Instructor">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardPageWrapper>
    )
  }

  const { mentor, students, serverId } = data
  const batchId = mentor.batchId

  const matches = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().includes(search.toLowerCase())

  const filtered = students.filter(
    (s) => !search || matches(s.name) || matches(s.email) || matches(s.phone),
  )
  const joinedRows = filtered.filter((s) => s.userId)
  const notJoinedRows = filtered.filter((s) => !s.userId)

  const joinedCount = students.filter((s) => s.userId).length
  const notJoined = students.length - joinedCount

  const channels = [
    {
      id: mentor.announcementChannelId,
      label: "Announcements",
      icon: Megaphone,
    },
    {
      id: mentor.discussionChannelId,
      label: "Discussion",
      icon: MessagesSquare,
    },
    { id: mentor.helpChannelId, label: "Help", icon: LifeBuoy },
    { id: mentor.resourceChannelId, label: "Resources", icon: BookOpen },
  ].filter((channel) => channel.id && serverId)

  return (
    <DashboardPageWrapper
      pageTitle={mentor.user.name}
      description={
        mentor.batch
          ? `Instructor in ${mentor.batch.name} — ${mentor.user.email}`
          : `Not assigned to a batch — ${mentor.user.email}`
      }
      actions={
        <>
          <Button variant="ghost" asChild>
            <Link href="/admin/instructors">
              <ArrowLeft className="size-4" />
              All instructors
            </Link>
          </Button>

          {batchId && (
            <>
              <Button
                variant="outline"
                disabled={isExporting}
                onClick={() =>
                  exportStudents({
                    type: "joined",
                    batchId,
                    mentorId: mentor.id,
                  })
                }
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export joined
              </Button>

              <Button
                variant="outline"
                disabled={isExporting}
                onClick={() =>
                  exportStudents({
                    type: "notJoined",
                    batchId,
                    mentorId: mentor.id,
                  })
                }
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export not joined
              </Button>

              <AssignStudentsDialog
                mentor={mentor}
                batchId={batchId}
                onSuccessAction={refetch}
              />

              <Button
                variant="outline"
                disabled={isSyncing}
                onClick={() => handleResync(batchId, mentor.id)}
              >
                {isSyncing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                {isSyncing
                  ? `${syncProgress.migrated}/${syncProgress.total}`
                  : "Re-sync roles"}
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {!mentor.batchId && (
          <DashboardNotice
            action={{ href: "/admin/batches", label: "Open batches" }}
          >
            This instructor is not in a batch yet, so students cannot be
            imported for them and no Discord channels exist.
          </DashboardNotice>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Assigned"
            value={students.length}
            hint="Imported onto their list"
            icon={UsersRound}
            tone="brand"
          />
          <StatTile
            label="Joined"
            value={joinedCount}
            hint="In their Discord channels"
            icon={GraduationCap}
            tone="good"
          />
          <StatTile
            label="Yet to join"
            value={notJoined}
            hint="Have not claimed their email"
            icon={UserRoundX}
            tone={notJoined > 0 ? "warn" : "good"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-card rounded-xl border p-6">
            <p className="text-muted-foreground text-sm font-medium">
              Progress
            </p>
            <JoinMeter
              className="mt-5"
              joined={joinedCount}
              assigned={students.length}
            />
          </div>

          <div className="bg-card rounded-xl border p-6">
            <p className="text-muted-foreground text-sm font-medium">
              Their channels
            </p>

            {channels.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {channels.map((channel) => (
                  <Link
                    key={channel.label}
                    href={`https://discord.com/channels/${serverId}/${channel.id}`}
                    target="_blank"
                    className="group hover:bg-muted/60 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <channel.icon
                      className="text-muted-foreground size-4"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                Channels are created when the instructor is added to a batch.
              </p>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ Students */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {filtered.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="joined">
                Joined
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {joinedRows.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notJoined">
                Not joined
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {notJoinedRows.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search name, email or phone"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {(
            [
              ["all", filtered],
              ["joined", joinedRows],
              ["notJoined", notJoinedRows],
            ] as const
          ).map(([value, rows]) => (
            <TabsContent key={value} value={value}>
              {rows.length === 0 ? (
                <EmptyState
                  icon={UsersRound}
                  title={search ? "Nobody matches" : "No students yet"}
                  description={
                    search
                      ? "Try a different name, email or phone number."
                      : "Import the batch first, then use Assign to paste their emails."
                  }
                />
              ) : (
                <StudentTable students={rows} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
