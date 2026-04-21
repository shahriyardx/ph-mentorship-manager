"use client"

import { useParams } from "@/hooks/use-params"
import { trpcVanilla } from "@/trpc/client"
import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { AddStudentsDialog } from "./add-students-dialog"
import type { inferRouterOutputs } from "@trpc/server"
import type { appRouter } from "@/trpc/routers/_app"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type MigrationProgress = {
  migrated: number
  total: number
}

type Mentor = inferRouterOutputs<typeof appRouter>["batch"]["mentors"][number]

const MentorRow = ({
  mentor,
  refetch,
}: {
  mentor: Mentor
  refetch: () => void
}) => {
  const { batchId } = useParams()

  const [isMigrating, setIsMigrating] = useState(false)
  const [progress, setProgress] = useState<MigrationProgress>({
    migrated: 0,
    total: 0,
  })

  const handleMigrate = async (mentorId: string) => {
    setIsMigrating(true)

    try {
      const stream = await trpcVanilla.batch.migrateStudents.mutate({
        batchId: batchId as string,
        mentorId: mentorId,
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

  return (
    <TableRow key={mentor.id}>
      <TableCell>{mentor.user.name}</TableCell>
      <TableCell>{mentor.user.email}</TableCell>
      <TableCell className="flex flex-col text-xs">
        <span>Assigned: {mentor._count.studentsDatas}</span>
        <span className="text-green-500">Joined: {mentor._count.students}</span>
      </TableCell>
      <TableCell className="space-x-2">
        <AddStudentsDialog mentor={mentor} onSuccessAction={refetch} />
        {mentor.unmigratedStudents > 0 && (
          <Button onClick={() => handleMigrate(mentor.id)}>
            {isMigrating && <Loader2 className="animate-spin" />}
            {isMigrating
              ? `Migrated ${progress?.migrated}/${progress?.total}`
              : `Migrate ${mentor.unmigratedStudents} Students`}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export default MentorRow
