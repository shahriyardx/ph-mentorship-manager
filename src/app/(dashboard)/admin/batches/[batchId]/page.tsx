"use client"

import { DashboardNotice } from "@/components/dashboard-notice"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { JoinMeter, StatTile } from "@/components/stat-tile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/trpc/client"
import { useParams } from "@/hooks/use-params"
import {
  ArrowLeft,
  Download,
  GraduationCap,
  Loader2,
  UserRound,
  UserRoundX,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EditBatchDialog } from "../edit-batch-dialog"
import { ImportStudentsDialog } from "./import-students-dialog"
import { Mentors } from "./mentors"

const page = () => {
  const { batchId } = useParams()

  const { data: batch, refetch } = trpc.batch.batchInfo.useQuery({
    batchId: batchId as string,
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

  if (!batch) {
    return (
      <DashboardPageWrapper pageTitle="Batch">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </DashboardPageWrapper>
    )
  }

  const notJoined = Math.max(batch.assignedStudents - batch.joinedStudents, 0)

  return (
    <DashboardPageWrapper
      pageTitle={batch.name}
      description="Mentors, students and Discord channels for this batch."
      actions={
        <>
          <Button variant="ghost" asChild>
            <Link href="/admin/batches">
              <ArrowLeft className="size-4" />
              All batches
            </Link>
          </Button>

          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() =>
              exportStudents({ type: "joined", batchId: batchId as string })
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
              exportStudents({ type: "notJoined", batchId: batchId as string })
            }
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export not joined
          </Button>

          <EditBatchDialog batch={batch} onSuccessAction={refetch} wide />

          <ImportStudentsDialog
            batchId={batchId as string}
            onSuccessAction={refetch}
          />
        </>
      }
    >
      <div className="space-y-6">
        {batch.unassignedStudents > 0 && (
          <DashboardNotice tone="info">
            {batch.unassignedStudents} imported student
            {batch.unassignedStudents === 1 ? " has" : "s have"} no instructor
            yet. Use Assign on a mentor row to hand them over — they cannot join
            until then.
          </DashboardNotice>
        )}

        {!batch.discord && (
          <DashboardNotice
            action={{ href: "/admin/settings", label: "Open Settings" }}
          >
            This batch has no Discord server, so students cannot join and mentor
            channels cannot be created.
          </DashboardNotice>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Mentors"
            value={batch.mentors}
            hint="Running this batch"
            icon={UserRound}
          />
          <StatTile
            label="Imported"
            value={batch.assignedStudents}
            hint={
              batch.unassignedStudents > 0
                ? `${batch.unassignedStudents} not assigned yet`
                : "All assigned to an instructor"
            }
            icon={UsersRound}
            tone={batch.unassignedStudents > 0 ? "warn" : "default"}
          />
          <StatTile
            label="Joined"
            value={batch.joinedStudents}
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
              Join progress
            </p>
            <JoinMeter
              className="mt-5"
              joined={batch.joinedStudents}
              assigned={batch.assignedStudents}
            />
          </div>

          <div className="bg-card rounded-xl border p-6">
            <p className="text-muted-foreground text-sm font-medium">
              Discord server
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {batch.discord ? (
                <>
                  <Button variant="outline" asChild>
                    <Link
                      href={`https://discord.com/channels/${batch.serverId}`}
                      target="_blank"
                    >
                      {batch.discord.name}
                    </Link>
                  </Button>

                  {!batch.discordServerId && (
                    <Badge variant="secondary">Default from Settings</Badge>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Not set. Pick one in Settings, or override it for this batch.
                </p>
              )}
            </div>

            <p className="text-muted-foreground mt-4 text-sm">
              Every mentor in this batch gets their own category, announcements
              and discussion channels inside this server.
            </p>
          </div>
        </div>

        <Mentors />
      </div>
    </DashboardPageWrapper>
  )
}

export default page
