"use client"

import type { AddStudentSchema } from "@/schema"
import { Controller, type UseFormReturn, useWatch } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select"

import { Textarea } from "../ui/textarea"
import { trpc } from "@/trpc/client"
import { useMemo } from "react"
import type z from "zod"

const AddStudentsForMentorForm = ({
  form,
  handleSubmit,
}: {
  form: UseFormReturn<z.infer<typeof AddStudentSchema>>
  handleSubmit: (values: { batchId: string; emails: string }) => void
}) => {
  const emails = useWatch({
    control: form.control,
    name: "emails",
  })

  const parsedEmails = useMemo(() => {
    return (
      emails?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? []
    )
  }, [emails])

  const { data: batches } = trpc.admin.batches.useQuery()

  return (
    <form
      id="add-students-for-mentor"
      onSubmit={form.handleSubmit((values) => handleSubmit(values))}
    >
      <FieldGroup>
        <Controller
          name="batchId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Batch</FieldLabel>
              <MultiSelect
                values={field.value ? [field.value] : undefined}
                onValuesChange={(values) => field.onChange(values[0])}
                single={true}
              >
                <MultiSelectTrigger>
                  <MultiSelectValue placeholder="Select batch" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectGroup>
                    {batches?.map((batch) => (
                      <MultiSelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectGroup>
                </MultiSelectContent>
              </MultiSelect>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="emails"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Students</FieldLabel>

              <Textarea
                id={field.name}
                name={field.name}
                placeholder="Paste student emails here"
                value={field.value}
                onChange={field.onChange}
                className="max-h-50"
              />

              <FieldDescription>
                {parsedEmails.length} emaiils found
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}

export default AddStudentsForMentorForm
