"use client"

import { trpc } from "@/trpc/client"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"

const page = () => {
  const { batchId } = useParams()
  const { data } = trpc.mentor.students.useQuery({
    batchId: batchId as string,
  })

  const { assignedStudents, joinedStudents } = useMemo(
    () => data ?? { assignedStudents: [], joinedStudents: [] },
    [data],
  )

  return (
    <div>
      <h1>Students</h1>
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
                <TableHead>Assigned At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.email}</TableCell>
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
