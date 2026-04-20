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
import { trpc } from "@/trpc/client"
import { AddMentor } from "../add-mentor"
import { AddStudentsDialog } from "./add-students-dialog"

export const Mentors = ({ className }: { className?: string }) => {
  const { batchId } = useParams()
  const { data: mentors, refetch } = trpc.batch.mentors.useQuery({ batchId })

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
              <TableCell>
                <AddStudentsDialog mentor={mentor} onSuccessAction={refetch} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
