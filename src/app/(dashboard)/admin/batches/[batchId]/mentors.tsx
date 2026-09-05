"use client"

import { EmptyState } from "@/components/empty-state"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useParams } from "@/hooks/use-params"
import { trpc } from "@/trpc/client"
import { UserRound } from "lucide-react"
import { AddMentor } from "../add-mentor"
import MentorRow from "./mentor-row"

export const Mentors = ({ className }: { className?: string }) => {
  const { batchId } = useParams()
  const { data: mentors, refetch } = trpc.batch.mentors.useQuery({ batchId })

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Mentors</h2>
          <p className="text-muted-foreground text-sm">
            Open a mentor to assign students, export lists or re-sync their
            Discord roles.
          </p>
        </div>

        <AddMentor batchId={batchId} refetch={refetch} />
      </div>

      {mentors && mentors.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No mentors in this batch yet"
          description="Add a mentor and their Discord category, channels and roles are created for them."
          action={<AddMentor batchId={batchId} refetch={refetch} />}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Mentor</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="w-0 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors?.map((mentor) => (
                <MentorRow key={mentor.id} mentor={mentor} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
