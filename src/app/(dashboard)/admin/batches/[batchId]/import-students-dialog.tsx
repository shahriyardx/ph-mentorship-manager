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
import { AddStudentSchema } from "@/schema"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

/**
 * Batch-level import. Everyone lands in the batch unassigned; an admin then
 * hands them to instructors from each mentor row.
 */
export const ImportStudentsDialog = ({
  batchId,
  onSuccessAction,
}: {
  batchId: string
  onSuccessAction?: () => void
}) => {
  const [open, setOpen] = useState(false)

  const { mutate: addStudents, isPending: isAdding } =
    trpc.admin.addStudents.useMutation({
      onSuccess: (result) => {
        toast.success(
          `${result.imported} student${result.imported === 1 ? "" : "s"} imported`,
          {
            description: [
              result.alreadyInBatch > 0
                ? `${result.alreadyInBatch} already in this batch`
                : null,
              result.duplicatesInFile > 0
                ? `${result.duplicatesInFile} repeated in the file`
                : null,
              result.errors.length > 0
                ? `${result.errors.length} row${result.errors.length === 1 ? "" : "s"} skipped: ${result.errors
                    .slice(0, 3)
                    .map((error) => `row ${error.row} (${error.reason})`)
                    .join(", ")}${result.errors.length > 3 ? ", ..." : ""}`
                : null,
              "They are unassigned until you give them to an instructor.",
            ]
              .filter(Boolean)
              .join(" · "),
            duration: 10000,
          },
        )

        form.reset({ file: "", filename: "" })
        setOpen(false)
        onSuccessAction?.()
      },
      onError: (error) => {
        toast.error("Import failed", { description: error.message })
      },
    })

  const form = useForm({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { file: "", filename: "" },
  })

  const handleAddStudents = (values: z.output<typeof AddStudentSchema>) => {
    addStudents({ ...values, batchId })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset({ file: "", filename: "" })
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" />
          Import students
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import students</DialogTitle>
          <DialogDescription>
            Upload the whole batch at once. Everyone arrives unassigned — you
            then hand them to instructors from the mentor rows below.
          </DialogDescription>
        </DialogHeader>

        <AddStudentsForMentorForm
          form={form}
          handleSubmit={handleAddStudents}
        />

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-students-for-mentor"
            disabled={isAdding}
          >
            {isAdding && <Loader2 className="size-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportStudentsDialog
