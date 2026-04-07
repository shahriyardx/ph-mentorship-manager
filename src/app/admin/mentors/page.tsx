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
  const { data: mentors, isPending } = trpc.admin.mentors.useQuery()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mentors</h1>
      {isPending && <p>Loading...</p>}

      <Table className="border-2">
        <TableCaption>A list of all mentors</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors?.map((mentor) => (
            <TableRow key={mentor.id}>
              <TableCell>{mentor.name}</TableCell>
              <TableCell>{mentor.email}</TableCell>
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
