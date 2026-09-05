"use client"

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { Mentor, User } from "@/generated/prisma/client"
import { AssignStudentsSchema } from "@/schema"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

export const AssignStudentsDialog = ({
  mentor,
  batchId,
  onSuccessAction,
}: {
  mentor: Mentor & { user: User }
  batchId: string
  onSuccessAction?: () => void
}) => {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(AssignStudentsSchema),
    defaultValues: { emails: "" },
  })

  const emails = useWatch({ control: form.control, name: "emails" })

  const found = useMemo(() => {
    const matches = emails?.match(EMAIL_REGEX) ?? []
    return new Set(matches.map((email) => email.toLowerCase())).size
  }, [emails])

  const { mutate: assignStudents, isPending } =
    trpc.admin.assignStudents.useMutation({
      onSuccess: (result) => {
        const notes = [
          result.movedFromAnotherInstructor > 0
            ? `${result.movedFromAnotherInstructor} moved from another instructor`
            : null,
          result.alreadyTheirs > 0
            ? `${result.alreadyTheirs} already theirs`
            : null,
          result.notInBatch.length > 0
            ? `${result.notInBatch.length} not in this batch: ${result.notInBatch.slice(0, 3).join(", ")}${result.notInBatch.length > 3 ? ", …" : ""}`
            : null,
          result.blockedJoined.length > 0
            ? `${result.blockedJoined.length} already joined under another instructor and were left alone`
            : null,
        ].filter(Boolean)

        toast.success(
          `${result.assigned} student${result.assigned === 1 ? "" : "s"} assigned`,
          {
            description: notes.join(" · "),
            duration: notes.length > 0 ? 10000 : 4000,
          },
        )

        form.reset({ emails: "" })
        setOpen(false)
        onSuccessAction?.()
      },
      onError: (error) => toast.error(error.message),
    })

  const handleSubmit = (values: z.output<typeof AssignStudentsSchema>) => {
    assignStudents({ ...values, mentorId: mentor.id, batchId })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset({ emails: "" })
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="size-3.5" />
          Assign
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign students</DialogTitle>
          <DialogDescription>
            Paste the emails of students already imported into this batch. They
            move onto {mentor.user.name}'s list.
          </DialogDescription>
        </DialogHeader>

        <form id="assign-students" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="emails"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Emails</FieldLabel>

                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"one@example.com\ntwo@example.com"}
                    className="max-h-56 min-h-32 font-mono text-sm"
                  />

                  <FieldDescription>
                    {found} unique email{found === 1 ? "" : "s"} found. Any
                    separator works — commas, spaces or new lines. Emails not
                    imported into this batch are skipped and reported back.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="assign-students" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Assign {found > 0 ? found : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignStudentsDialog
