"use client"

import { Controller, useForm } from "react-hook-form"
import {
  Field,
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
        <div className="p-5 rounded-md border-2 mt-5">
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
        <div className="p-5 rounded-md border-2 mt-5">
          <h2 className="text-2xl font-bold">Join Mentorship Program</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email below to join the mentorship program.
          </p>
          <form
            onSubmit={form.handleSubmit((values) => joinMentorship(values))}
            className="mt-3"
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Email"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button>Join Now</Button>
            </FieldGroup>
          </form>
        </div>
      )}
    </div>
  )
}

export default StudentJoinForm
