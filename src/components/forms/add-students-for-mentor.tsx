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
import { Textarea } from "../ui/textarea"
import { useMemo } from "react"
import type z from "zod"

const AddStudentsForMentorForm = ({
  form,
  handleSubmit,
}: {
  form: UseFormReturn<z.infer<typeof AddStudentSchema>>
  handleSubmit: (values: { emails: string }) => void
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

  return (
    <form
      id="add-students-for-mentor"
      onSubmit={form.handleSubmit((values) => handleSubmit(values))}
    >
      <FieldGroup>
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
