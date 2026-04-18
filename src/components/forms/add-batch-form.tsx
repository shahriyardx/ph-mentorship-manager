"use client"

import { useForm, Controller } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import { BatchSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const AddBatchForm = () => {
  const trpcUtils = trpc.useUtils()
  const form = useForm({
    resolver: zodResolver(BatchSchema),
  })
  const { data: servers } = trpc.discord.getServers.useQuery()

  const { mutate: addBatch } = trpc.admin.addBatch.useMutation({
    onSuccess: () => {
      form.reset({
        name: "",
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

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}

export default AddBatchForm
