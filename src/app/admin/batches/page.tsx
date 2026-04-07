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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const page = () => {
  const { data: batches, isPending, refetch } = trpc.admin.batches.useQuery()
  const { mutate: deleteBatch } = trpc.admin.deleteBatch.useMutation({
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Batches</h1>
      {isPending && <p>Loading...</p>}

      <Table className="border-2">
        <TableCaption>A list of all batches</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>All Students</TableHead>
            <TableHead>Joined Students</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches?.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell>{batch.name}</TableCell>
              <TableCell>{batch._count.students_data}</TableCell>
              <TableCell>{batch._count.students}</TableCell>
              <TableCell className="text-right space-x-1">
                {batch.isCurrent ? null : (
                  <Button
                    variant={"outline"}
                    onClick={() => setCurrentBatch({ id: batch.id })}
                  >
                    Set as Current
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger>
                    <Button variant="destructive">Delete</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the batch and remove all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => deleteBatch({ id: batch.id })}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page
