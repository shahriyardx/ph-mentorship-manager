"use client"

import { AddStudentSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import { toast } from "sonner"

const AddStudentsForMentorForm = ({
  mentor,
  refetch,
}: {
  mentor: { id: string; name: string; email: string }
  refetch: () => void
}) => {
  const form = useForm({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: {
      mentorId: mentor.id,
    },
  })

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
  const { mutate: addStudents } = trpc.admin.addStudents.useMutation({
    onSuccess: () => {
      form.reset({
        batchId: "",
        emails: "",
      })
      toast.success("Students added successfully")
      refetch()
    },
  })

  return (
    <form
      id="add-students-for-mentor"
      onSubmit={form.handleSubmit((values) => {
        addStudents(values)
      })}
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
