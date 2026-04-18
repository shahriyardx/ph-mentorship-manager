"use client"

import Link from "next/link"
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
import { CreateBatchDialog } from "./create-batch-dialog"

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

  return (
    <DashboardPageWrapper pageTitle="Batches">
      <div>
        {isPending && <p className="mb-2">Loading...</p>}

        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Batches</h1>
          <CreateBatchDialog />
        </div>
        <Table className="border-2">
          <TableCaption>A list of all batches</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches?.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell className="flex flex-col text-xs">
                  <span>Assigned: {batch._count.students_data}</span>
                  <span className="text-green-500">
                    Joined: {batch._count.students}
                  </span>
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
