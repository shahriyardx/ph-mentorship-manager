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

const page = () => {
  const { data: batches, isPending } = trpc.admin.batches.useQuery()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Batches</h1>
      {isPending && <p>Loading...</p>}

      <Table className="border-2">
        <TableCaption>A list of all batches</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Students</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches?.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell>{batch.name}</TableCell>
              <TableCell>{batch._count.students}</TableCell>
              <TableCell className="text-right">
                <Button variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page
