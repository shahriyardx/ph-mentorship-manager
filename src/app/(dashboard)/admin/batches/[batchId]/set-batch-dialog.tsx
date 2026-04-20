"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { BatchSetDiscordSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import type z from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

type Props = {
  batchId: string
  onSuccessAction?: () => void
}

const SetBatchDialog = ({ batchId, onSuccessAction }: Props) => {
  const { data: servers } = trpc.discord.getServers.useQuery()
  const { mutate: setDiscord } = trpc.batch.setDiscord.useMutation({
    onSuccess: () => {
      toast.success("Discord server set successfully")
      onSuccessAction?.()
    },
  })

  const form = useForm({
    resolver: zodResolver(BatchSetDiscordSchema),
    defaultValues: {
      batchId: batchId,
    },
  })

  const handleSubmit = (data: z.output<typeof BatchSetDiscordSchema>) => {
    setDiscord(data, {})
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"xs"}>Set Discord</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Batch</DialogTitle>
        </DialogHeader>

        <form id="set-batch-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="discordServerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Discord Server</FieldLabel>
                  <MultiSelect
                    values={field.value ? [field.value] : undefined}
                    onValuesChange={(values) => field.onChange(values[0])}
                    single={true}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select a server" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {servers?.map((server) => (
                          <MultiSelectItem key={server.id} value={server.id}>
                            {server.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button form="set-batch-form" type="submit">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SetBatchDialog
