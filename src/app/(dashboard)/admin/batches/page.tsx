"use client"

import { trpc } from "@/trpc/client"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { DeleteBatchDialog } from "./delete-batch-dialog"
import { AddMentor } from "./add-mentor"
import Link from "next/link"

const page = () => {
  const { data: batches, isPending, refetch } = trpc.admin.batches.useQuery()
  const { mutate: deleteBatch, isPending: isDeleting } =
    trpc.admin.deleteBatch.useMutation({
      onSuccess: () => {
        refetch()
      },
    })
  const { mutate: setCurrentBatch } = trpc.admin.setCurrentBatch.useMutation({
    onSuccess: () => {
      refetch()
    },
  })
  const { mutate: exportStudents } = trpc.admin.exportStudents.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a")
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.base64}`
      link.download = data.filename
      link.click()
      link.remove()
    },
  })

  return (
    <DashboardPageWrapper pageTitle="Batches">
      <div>
        {isPending && <p className="mb-2">Loading...</p>}
        <Table className="border-2">
          <TableCaption>A list of all batches</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>All Students</TableHead>
              <TableHead>Joined Students</TableHead>
              <TableHead>Export</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell>{batch._count.students_data}</TableCell>
                <TableCell>{batch._count.students}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant={"outline"}
                    onClick={() =>
                      exportStudents({ type: "joined", batchId: batch.id })
                    }
                  >
                    Export Joined
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() =>
                      exportStudents({ type: "notJoined", batchId: batch.id })
                    }
                  >
                    Export Not Joined
                  </Button>
                </TableCell>
                <TableCell className="space-x-2">
                  {batch.isCurrent ? null : (
                    <Button
                      variant={"outline"}
                      onClick={() => setCurrentBatch({ id: batch.id })}
                    >
                      Set as Current
                    </Button>
                  )}

                  <Button asChild>
                    <Link href={`/admin/batches/${batch.id}`}>View Batch</Link>
                  </Button>
                  <AddMentor batchId={batch.id} />
                  <DeleteBatchDialog
                    batchId={batch.id}
                    isDeleting={isDeleting}
                    deleteBatch={deleteBatch}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
