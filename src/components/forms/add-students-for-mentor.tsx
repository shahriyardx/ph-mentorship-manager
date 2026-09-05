"use client"

import type { AddStudentSchema } from "@/schema"
import { type UseFormReturn, useWatch } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field"
import { Input } from "../ui/input"
import { useState } from "react"
import type z from "zod"

const ACCEPTED = ".xlsx,.xls"

const readAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(",") + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const AddStudentsForMentorForm = ({
  form,
  handleSubmit,
}: {
  form: UseFormReturn<z.infer<typeof AddStudentSchema>>
  handleSubmit: (values: z.infer<typeof AddStudentSchema>) => void
}) => {
  const [readError, setReadError] = useState<string | null>(null)
  const filename = useWatch({ control: form.control, name: "filename" })

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      form.setValue("file", "", { shouldValidate: true })
      form.setValue("filename", "", { shouldValidate: true })
      return
    }

    setReadError(null)

    try {
      const base64 = await readAsBase64(file)
      form.setValue("file", base64, { shouldValidate: true })
      form.setValue("filename", file.name, { shouldValidate: true })
    } catch {
      setReadError("The file could not be read. Please try again.")
      form.setValue("file", "", { shouldValidate: true })
      form.setValue("filename", "", { shouldValidate: true })
    }
  }

  return (
    <form
      id="add-students-for-mentor"
      onSubmit={form.handleSubmit((values) => handleSubmit(values))}
    >
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.file || !!readError}>
          <FieldLabel htmlFor="students-file">Students file</FieldLabel>

          <Input
            id="students-file"
            type="file"
            accept={ACCEPTED}
            onChange={onFileChange}
          />

          <FieldDescription>
            Excel file (.xlsx or .xls). The first row must have the column
            headers <span className="font-medium">Name</span>,{" "}
            <span className="font-medium">Email</span> and{" "}
            <span className="font-medium">Phone</span>. Rows that are missing
            any of the three are skipped.
          </FieldDescription>

          {filename ? (
            <FieldDescription className="text-foreground">
              Selected: {filename}
            </FieldDescription>
          ) : null}

          {readError ? (
            <FieldError errors={[{ message: readError }]} />
          ) : form.formState.errors.file ? (
            <FieldError errors={[form.formState.errors.file]} />
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  )
}

export default AddStudentsForMentorForm
