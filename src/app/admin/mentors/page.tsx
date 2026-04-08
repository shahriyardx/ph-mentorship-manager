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
import AddStudentsForMentorForm from "@/components/forms/add-students-for-mentor"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AddStudentSchema } from "@/schema"
import { toast } from "sonner"
import type { Mentor } from "@/generated/prisma/client"
import { useState } from "react"
import type z from "zod"
import { Loader2 } from "lucide-react"

const page = () => {
  const [selectedMentor, setSelectedMentor] = useState<
    (Mentor & { user: { name: string; email: string } }) | null
  >(null)

  const trpcUtils = trpc.useUtils()

  const { data: mentors, isPending, refetch } = trpc.admin.mentors.useQuery()
  const { mutate: deleteMentor } = trpc.admin.deleteMentor.useMutation({
    onSuccess: () => {
      trpcUtils.admin.mentors.invalidate()
    },
  })

  const form = useForm({
    resolver: zodResolver(AddStudentSchema),
  })

  const { mutate: addStudents, isPending: isAdding } =
    trpc.admin.addStudents.useMutation({
      onSuccess: () => {
        toast.success("Students added successfully")
        form.reset({
          batchId: "",
          emails: "",
        })
        refetch()
        setSelectedMentor(null)
      },
    })

  const handleAddStudents = (values: z.infer<typeof AddStudentSchema>) => {
    if (!selectedMentor) return

    addStudents({ ...values, mentorId: selectedMentor?.id })
  }

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
            <TableHead>Assgined Students</TableHead>
            <TableHead>Joined Students</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors?.map((mentor) => (
            <TableRow key={mentor.id}>
              <TableCell>{mentor.name}</TableCell>
              <TableCell>{mentor.email}</TableCell>
              <TableCell>{mentor._count.studentsDatas}</TableCell>
              <TableCell>{mentor._count.students}</TableCell>
              <TableCell className="flex gap-2">
                <Button onClick={() => setSelectedMentor(mentor)}>
                  Add Students
                </Button>

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
                        onClick={() => deleteMentor({ id: mentor.id })}
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

      <Dialog
        open={!!selectedMentor}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedMentor(null)
          }
        }}
      >
        <DialogContent>
          {selectedMentor && (
            <DialogHeader>
              <DialogTitle>Add Students</DialogTitle>
              <DialogDescription>
                <p>
                  <span className="font-bold">Mentor: </span>{" "}
                  {selectedMentor.user.name}
                </p>
                <p>
                  <span className="font-bold">Email: </span>
                  {selectedMentor.user.email}
                </p>
              </DialogDescription>
            </DialogHeader>
          )}
          <AddStudentsForMentorForm
            form={form}
            handleSubmit={handleAddStudents}
          />
          <DialogFooter>
            <Button
              type="submit"
              form="add-students-for-mentor"
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default page
