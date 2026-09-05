"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/** One row of the merged student table. */
export type StudentRow = {
  id: string
  name: string
  email: string
  phone: string
  userId: string | null
  joinedAt: Date | null
  user?: { name: string } | null
}

export const JoinedBadge = ({ joined }: { joined: boolean }) =>
  joined ? (
    <Badge
      variant="outline"
      className="border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
    >
      Joined
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-amber-500/40 bg-amber-500/15 text-amber-400"
    >
      Not joined
    </Badge>
  )

/**
 * Shared student table. One record per student now, so "joined" is simply
 * whether the row has a user attached.
 */
export const StudentTable = ({
  students,
  actions,
}: {
  students: StudentRow[]
  /** Optional per-row control, e.g. a remove button. */
  actions?: (student: StudentRow) => React.ReactNode
}) => {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Discord</TableHead>
            <TableHead>Status</TableHead>
            {actions && (
              <TableHead className="w-0 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.name || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {student.email}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {student.phone || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {student.user?.name ?? "—"}
              </TableCell>
              <TableCell>
                <JoinedBadge joined={!!student.userId} />
              </TableCell>
              {actions && (
                <TableCell>
                  <div className="flex justify-end">{actions(student)}</div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
