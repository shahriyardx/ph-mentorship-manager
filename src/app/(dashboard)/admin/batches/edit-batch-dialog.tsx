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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BatchUpdateSchema } from "@/schema"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type z from "zod"

type Props = {
  batch: { id: string; name: string; discordServerId: string | null }
  onSuccessAction?: () => void
  /** Render as a full button instead of the compact icon trigger. */
  wide?: boolean
}

const USE_DEFAULT = "__default__"

export const EditBatchDialog = ({ batch, onSuccessAction, wide }: Props) => {
  const [open, setOpen] = useState(false)

  const { data: servers } = trpc.discord.getServers.useQuery()
  const { data: settings } = trpc.admin.settings.useQuery()

  const defaultServer = servers?.find(
    (server) => server.id === settings?.serverId,
  )

  const form = useForm({
    resolver: zodResolver(BatchUpdateSchema),
    defaultValues: {
      id: batch.id,
      name: batch.name,
      discordServerId: batch.discordServerId ?? "",
    },
  })

  const { mutate: updateBatch, isPending } = trpc.admin.updateBatch.useMutation(
    {
      onSuccess: () => {
        toast.success("Batch updated")
        setOpen(false)
        onSuccessAction?.()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const handleSubmit = (values: z.output<typeof BatchUpdateSchema>) => {
    updateBatch(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          form.reset({
            id: batch.id,
            name: batch.name,
            discordServerId: batch.discordServerId ?? "",
          })
        }
      }}
    >
      <DialogTrigger asChild>
        {wide ? (
          <Button variant="outline">
            <Pencil className="size-3.5" />
            Edit batch
          </Button>
        ) : (
          <Button size="sm" variant="ghost">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit batch</DialogTitle>
          <DialogDescription>
            Rename the batch, or move it to a different Discord server.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-batch-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Batch name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="discordServerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Discord server</FieldLabel>

                  <Select
                    value={field.value || USE_DEFAULT}
                    onValueChange={(value) =>
                      field.onChange(value === USE_DEFAULT ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USE_DEFAULT}>
                        {defaultServer
                          ? `Default — ${defaultServer.name}`
                          : "Use the default from Settings"}
                      </SelectItem>
                      {servers?.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Changing this does not move channels that already exist. New
                    mentor channels are created in the new server.
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
          <Button type="submit" form="edit-batch-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditBatchDialog
