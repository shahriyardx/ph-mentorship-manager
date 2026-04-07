"use client"

import { Controller, useForm } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { StudentJoinSchema } from "@/schema"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { useMemo } from "react"

const StudentJoinForm = () => {
  const form = useForm({
    resolver: zodResolver(StudentJoinSchema),
  })

  const { data: studentInfo, refetch } = trpc.student.getStudentInfo.useQuery()

  const { mutate: joinMentorship } = trpc.student.joinMentorship.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (e) => {
      form.setError("email", { message: e.message })
    },
  })

  const student = useMemo(() => studentInfo?.student, [studentInfo])

  return (
    <div>
      {student ? (
        <div className="p-10 rounded-md border-2 text-center">
          <h2 className="text-2xl font-bold">Mentorship Program</h2>
          <div>
            <p className="mt-2">
              Your mentor is {student.mentor?.user?.name}.{" "}
              <Link
                href={`https://discord.com/channels/${studentInfo?.serverId}/${student.mentor?.discordChannelId}`}
                className="text-indigo-400 underline underline-offset-2"
              >
                Click here
              </Link>{" "}
              to view your mentor's discord channel
            </p>
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-md border-2 text-center">
          <h2 className="text-2xl font-bold">Join Mentorship Program</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your course email below to join the mentorship program.
          </p>
          <form
            onSubmit={form.handleSubmit((values) => joinMentorship(values))}
            className="mt-5"
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      placeholder="Your course email"
                      className="px-6 py-6"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        className="text-center"
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Button className="p-6 rounded-full bg-purple-500 text-white cursor-pointer hover:bg-purple-600">
                Join Now
              </Button>
            </FieldGroup>
          </form>
        </div>
      )}
    </div>
  )
}

export default StudentJoinForm
