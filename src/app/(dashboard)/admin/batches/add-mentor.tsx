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
import { Controller, useForm } from "react-hook-form"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { AddMentorSchema } from "@/schema"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export const AddMentor = ({ batchId }: { batchId: string }) => {
  const form = useForm({
    resolver: zodResolver(AddMentorSchema),
  })

  const { mutate: addMentor, isPending } = trpc.admin.addMentor.useMutation({
    onSuccess: () => {
      form.reset({
        mentors: [],
      })
      toast.success("Mentor added successfully")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  const { data: mentors } = trpc.admin.mentorsNotAddedToBatch.useQuery({
    batchId,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Add Mentors</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Mentor</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) =>
            addMentor({ ...values, batchId }),
          )}
          id="add-mentor-batch"
        >
          <FieldGroup>
            <Controller
              name="mentors"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mentors</FieldLabel>
                  <MultiSelect
                    values={field.value}
                    onValuesChange={(values) => field.onChange(values)}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select mentors" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {mentors?.map((mentor) => (
                          <MultiSelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
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
          <Button type="submit" form="add-mentor-batch" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
