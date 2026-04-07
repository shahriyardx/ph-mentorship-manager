"use client"

import { useForm, Controller } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Button } from "../ui/button"
import { BatchSchema } from "@/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const AddBatchForm = () => {
  const form = useForm({
    resolver: zodResolver(BatchSchema),
  })

  const trpcUtils = trpc.useUtils()

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
    <Card>
      <CardHeader>
        <CardTitle>Add Batch</CardTitle>
        <CardDescription>
          Enter the details of the batch you want to add.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="add-batch-form"
          onSubmit={form.handleSubmit((data) => {
            addBatch(data)
          })}
        >
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="add-batch-form">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AddBatchForm
