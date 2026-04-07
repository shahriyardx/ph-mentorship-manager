"use client"

import { trpc } from "@/trpc/client"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"

const page = () => {
  const { batchId } = useParams()
  const { data, isPending } = trpc.mentor.students.useQuery({
    batchId: batchId as string,
  })

  const { assignedStudents, joinedStudents } = useMemo(
    () => data ?? { assignedStudents: [], joinedStudents: [] },
    [data],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Students</h1>
      {isPending && <p className="my-3">Loading...</p>}

      <Tabs defaultValue="assigned">
        <TabsList>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Table className="border-2">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status (joined/not)</TableHead>
                <TableHead>Assigned At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {joinedStudents.find((s) => s.email === student.email) ? (
                      <span className="text-green-400">Joined</span>
                    ) : (
                      <span className="text-destructive">Not Joined</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="joined">
          <Table className="border-2">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {joinedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.user.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Button>Completed</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default page
