"use client"

import { useForm, Controller } from "react-hook-form"
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
import { BatchSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const AddBatchForm = () => {
  const trpcUtils = trpc.useUtils()
  const form = useForm({
    resolver: zodResolver(BatchSchema),
    defaultValues: { name: "", discordServerId: "" },
  })

  const { data: servers } = trpc.discord.getServers.useQuery()
  const { data: settings } = trpc.admin.settings.useQuery()

  const defaultServer = servers?.find(
    (server) => server.id === settings?.serverId,
  )

  const { mutate: addBatch } = trpc.admin.addBatch.useMutation({
    onSuccess: () => {
      form.reset({
        name: "",
        discordServerId: "",
      })
      toast.success("Batch added successfully")
      trpcUtils.admin.batches.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <form
      id="add-batch-form"
      onSubmit={form.handleSubmit((data) => {
        addBatch(data)
      })}
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Batch Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Batch XX"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="discordServerId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Discord Server</FieldLabel>

              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      defaultServer
                        ? `Default — ${defaultServer.name}`
                        : "Use the default from Settings"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {servers?.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldDescription>
                {settings?.serverId
                  ? "Leave this alone to use the server from Settings. Pick one only if this batch runs somewhere else."
                  : "No default server is set in Settings yet, so pick one here."}
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}

export default AddBatchForm
