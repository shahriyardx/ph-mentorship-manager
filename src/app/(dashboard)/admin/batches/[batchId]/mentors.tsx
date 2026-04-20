"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useParams } from "@/hooks/use-params"
import { trpc, trpcVanilla } from "@/trpc/client"
import { AddMentor } from "../add-mentor"
import { AddStudentsDialog } from "./add-students-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type MigrationProgress = {
  migrated: number
  total: number
}

export const Mentors = ({ className }: { className?: string }) => {
  const { batchId } = useParams()
  const { data: mentors, refetch } = trpc.batch.mentors.useQuery({ batchId })

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
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Mentors</h1>
        <AddMentor batchId={batchId} />
      </div>

      <Table className="border-2">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Students</TableHead>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors?.map((mentor) => (
            <TableRow key={mentor.id}>
              <TableCell>{mentor.user.name}</TableCell>
              <TableCell>{mentor.user.email}</TableCell>
              <TableCell className="flex flex-col text-xs">
                <span>Assigned: {mentor._count.studentsDatas}</span>
                <span className="text-green-500">
                  Joined: {mentor._count.students}
                </span>
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
