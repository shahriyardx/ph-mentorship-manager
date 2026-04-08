"use client"

import { useForm, Controller } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { MentorSchema } from "@/schema"
import { useDiscord } from "@/hooks/useDiscord"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const AddMentorForm = () => {
  const form = useForm({
    resolver: zodResolver(MentorSchema),
  })

  const trpcUtils = trpc.useUtils()

  const { data: settings } = trpc.admin.settings.useQuery()
  const { data: channels } = useDiscord({
    entity: "channels",
    guildId: settings?.serverId,
  })

  const { data: users, refetch } = trpc.admin.appliedForMentor.useQuery()
  const { mutate: addMentor } = trpc.admin.addMentor.useMutation({
    onSuccess: () => {
      form.reset({
        mentorId: "",
        discordChannelId: "",
      })
      toast.success("Mentor added successfully")
      trpcUtils.admin.mentors.invalidate()
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Mentor</CardTitle>
        <CardDescription>
          Enter the details of the mentor you want to add.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="add-mentor-form"
          onSubmit={form.handleSubmit((data) => {
            addMentor(data)
          })}
        >
          <FieldGroup>
            <Controller
              name="mentorId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>User</FieldLabel>
                  <MultiSelect
                    values={field.value ? [field.value] : undefined}
                    onValuesChange={(values) => field.onChange(values[0])}
                    single={true}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select a user" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {users?.map((user) => (
                          <MultiSelectItem key={user.id} value={user.id}>
                            {user.name}
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
            <Controller
              name="discordChannelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Discord Channel</FieldLabel>

                  <MultiSelect
                    values={field.value ? [field.value] : undefined}
                    onValuesChange={(values) => field.onChange(values[0])}
                    single={true}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select a channel" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {channels.map((channel) => (
                          <MultiSelectItem key={channel.id} value={channel.id}>
                            {channel.name}
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
      </CardContent>
      <CardFooter>
        <Button type="submit" form="add-mentor-form">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AddMentorForm
