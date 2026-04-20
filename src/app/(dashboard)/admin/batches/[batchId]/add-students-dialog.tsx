"use client"

import AddStudentsForMentorForm from "@/components/forms/add-students-for-mentor"
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
import type { Mentor, User } from "@/generated/prisma/client"
import { useParams } from "@/hooks/use-params"
import { AddStudentSchema } from "@/schema"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

export const AddStudentsDialog = ({
  mentor,
  onSuccessAction,
}: {
  mentor: Mentor & { user: User }
  onSuccessAction?: () => void
}) => {
  const { batchId } = useParams()
  const { mutate: addStudents, isPending: isAdding } =
    trpc.admin.addStudents.useMutation({
      onSuccess: () => {
        toast.success("Students added successfully")
        form.reset({
          emails: "",
        })
        onSuccessAction?.()
      },
    })

  const form = useForm({
    resolver: zodResolver(AddStudentSchema),
  })

  const handleAddStudents = (values: z.output<typeof AddStudentSchema>) => {
    addStudents({ ...values, mentorId: mentor.id, batchId })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Students</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
          <DialogDescription>
            <p>
              <span className="font-bold">Mentor: </span> {mentor.user.name}
            </p>
            <p>
              <span className="font-bold">Email: </span>
              {mentor.user.email}
            </p>
          </DialogDescription>
        </DialogHeader>

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
  )
}
