"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/trpc/client"
import { Loader2, UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const AddInstructorDialog = ({
  onSuccessAction,
}: {
  onSuccessAction?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [batchId, setBatchId] = useState<string | undefined>()

  const { data: batches } = trpc.admin.batches.useQuery(undefined, {
    enabled: open,
  })

  const currentBatch = batches?.find((batch) => batch.isCurrent)
  const selectedBatch = batchId ?? currentBatch?.id

  // Candidates depend on the batch: someone may already run a different one.
  const { data: candidates, isPending: loadingCandidates } =
    trpc.admin.instructorCandidates.useQuery(
      { batchId: selectedBatch },
      { enabled: open && !!selectedBatch },
    )
  const selectedUser = candidates?.find((user) => user.id === userId)

  const { mutate: addInstructor, isPending } =
    trpc.admin.addInstructor.useMutation({
      onSuccess: () => {
        toast.success("Instructor added", {
          description:
            "Their Discord category, channels and role have been created.",
        })
        setOpen(false)
        setUserId(undefined)
        setBatchId(undefined)
        onSuccessAction?.()
      },
      onError: (error) => toast.error(error.message),
    })

  const canSubmit = !!userId && !!selectedBatch && !isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setUserId(undefined)
          setBatchId(undefined)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Add instructor
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add instructor</DialogTitle>
          <DialogDescription>
            Pick a user and a batch. They get the mentor role, and their Discord
            category, channels and role are created for them.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="instructor-user">User</FieldLabel>

            <MultiSelect
              single
              values={userId ? [userId] : undefined}
              onValuesChange={(values) => setUserId(values[0])}
            >
              <MultiSelectTrigger
                id="instructor-user"
                className="w-full justify-between text-left"
              >
                <MultiSelectValue
                  placeholder={
                    !selectedBatch
                      ? "Pick a batch first"
                      : loadingCandidates
                        ? "Loading users…"
                        : "Search for a user"
                  }
                />
              </MultiSelectTrigger>
              <MultiSelectContent
                search={{
                  placeholder: "Search name or email",
                  emptyMessage: "No matching user",
                }}
              >
                <MultiSelectGroup>
                  {candidates?.map((user) => (
                    <MultiSelectItem
                      key={user.id}
                      value={user.id}
                      keywords={[user.name, user.email]}
                    >
                      {/* One line: this markup is reused inside the trigger. */}
                      <span className="flex min-w-0 items-center gap-2 text-left">
                        <Avatar className="size-5 shrink-0">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="text-[0.6rem]">
                            {user.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <span className="truncate text-sm">{user.name}</span>

                        <span className="text-muted-foreground truncate text-xs">
                          {user.email}
                        </span>

                        {user.appliedForMentor && (
                          <span className="shrink-0 text-xs text-amber-400">
                            applied
                          </span>
                        )}
                      </span>
                    </MultiSelectItem>
                  ))}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>

            <FieldDescription>
              {candidates && candidates.length === 0
                ? "Everyone already instructs this batch."
                : "People already instructing this batch are hidden. Anyone who applied is listed first. A mentor can run more than one batch."}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="instructor-batch">Batch</FieldLabel>

            <Select value={selectedBatch} onValueChange={setBatchId}>
              <SelectTrigger id="instructor-batch" className="w-full">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                    {batch.isCurrent ? " (current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldDescription>
              Their channels are created inside this batch's Discord server.
            </FieldDescription>
          </Field>

          {selectedUser && selectedUser.role !== "user" && (
            <p className="text-muted-foreground text-sm">
              {selectedUser.name} is currently{" "}
              <span className="capitalize">{selectedUser.role}</span>. That role
              is kept as it is.
            </p>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              userId &&
              selectedBatch &&
              addInstructor({ userId, batchId: selectedBatch })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Add instructor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddInstructorDialog
