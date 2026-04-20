"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc, trpcVanilla } from "@/trpc/client"
import Link from "next/link"
import { Mentors } from "./mentors"
import { Button } from "@/components/ui/button"
import { useParams } from "@/hooks/use-params"
import SetBatchDialog from "./set-batch-dialog"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type MigrationProgress = {
  migrated: number
  total: number
}

const page = () => {
  const [isMigrating, setIsMigrating] = useState(false)
  const [progress, setProgress] = useState<MigrationProgress>({
    migrated: 0,
    total: 0,
  })
  const { batchId } = useParams()

  const { data: batch, refetch } = trpc.batch.batchInfo.useQuery({
    batchId: batchId as string,
  })

  const handleMigrate = async () => {
    setIsMigrating(true)

    try {
      const stream = await trpcVanilla.batch.migrateStudents.mutate({
        batchId: batchId as string,
      })
      for await (const update of stream) {
        setProgress(update)
        if (update.migrated === update.total) {
          refetch()
        }
      }
    } finally {
      setIsMigrating(false)
    }
  }

  const { mutate: exportStudents } = trpc.admin.exportStudents.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a")
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.base64}`
      link.download = data.filename
      link.click()
      link.remove()
    },
  })

  if (!batch) return

  return (
    <DashboardPageWrapper pageTitle={"Batch Details"}>
      <div className="@container">
        <div className="grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-3 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{batch.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="flex items-center justify-between">
                <strong>Discord Server:</strong>
                {batch.discord ? (
                  <Link
                    className="bg-indigo-500/30 text-indigo-500 p-1 rounded-md hover:underline"
                    href={`https://discord.com/channels/${batch.discordServerId}`}
                  >
                    {batch.discord.name}
                  </Link>
                ) : (
                  <SetBatchDialog
                    batchId={batch.id}
                    onSuccessAction={refetch}
                  />
                )}
              </p>

              <p className="flex items-center justify-between">
                <strong>Mentors:</strong> {batch.mentors}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl">{batch.assignedStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Joined Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl">{batch.joinedStudents}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          variant={"outline"}
          onClick={() => exportStudents({ type: "joined", batchId: batchId })}
        >
          Export Joined
        </Button>
        <Button
          variant={"outline"}
          onClick={() =>
            exportStudents({ type: "notJoined", batchId: batchId })
          }
        >
          Export Not Joined
        </Button>

        {batch.unmigratedStudents > 0 && (
          <Button onClick={() => handleMigrate()}>
            {isMigrating && <Loader2 className="animate-spin" />}
            {isMigrating
              ? `Migrated ${progress?.migrated}/${progress?.total}`
              : "Migrate Students"}
          </Button>
        )}
      </div>

      <Mentors className="mt-5" />
    </DashboardPageWrapper>
  )
}

export default page
