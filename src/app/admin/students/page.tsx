"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/trpc/client"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const page = () => {
  const [selectedMentor, setSelectedMentor] = useState<string | undefined>(
    undefined,
  )
  const [selectedBatch, setSelectedBatch] = useState<string | undefined>(
    undefined,
  )

  const { data: mentors } = trpc.admin.mentors.useQuery()
  const { data: batches } = trpc.admin.batches.useQuery()
  const { data: students } = trpc.admin.studentsByMentor.useQuery(
    {
      mentorId: selectedMentor,
      batchId: selectedBatch,
    },
    {
      enabled: !!selectedMentor && !!selectedBatch,
    },
  )

  const { assignedStudents, joinedStudents } = students || {
    assignedStudents: [],
    joinedStudents: [],
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-5"></div>

      <div>
        <Tabs defaultValue="assigned">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="joined">Joined</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBatch && (
                <Select onValueChange={setSelectedMentor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors?.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {joinedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.user.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default page
