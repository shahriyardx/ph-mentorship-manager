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
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"

const page = () => {
  const { batchId } = useParams()
  const { data, isPending } = trpc.mentor.students.useQuery({
    batchId: batchId as string,
  })

  const { assignedStudents, joinedStudents } = useMemo(
    () => data ?? { assignedStudents: [], joinedStudents: [] },
    [data],
  )

  const { mutate: exportStudents } = trpc.mentor.exportStudents.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a")
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.base64}`
      link.download = data.filename
      link.click()
      link.remove()
    },
  })

  return (
    <DashboardPageWrapper pageTitle="Students">
      <div>
        {isPending && <p className="mb-2">Loading...</p>}

        <Tabs defaultValue="assigned">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="joined">Joined</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                onClick={() =>
                  exportStudents({ type: "joined", batchId: batchId as string })
                }
              >
                Export Joined
              </Button>
              <Button
                variant={"outline"}
                onClick={() =>
                  exportStudents({
                    type: "notJoined",
                    batchId: batchId as string,
                  })
                }
              >
                Export Not Joined
              </Button>
            </div>
          </div>
          <TabsContent value="assigned">
            <Table className="border-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
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
    </DashboardPageWrapper>
  )
}

export default page
