"use client"

import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { StudentJoinSchema } from "@/schema"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { useMemo } from "react"
import Image from "next/image"
import { ArrowUpRight, Loader2 } from "lucide-react"

const StudentJoinForm = () => {
  const form = useForm({
    resolver: zodResolver(StudentJoinSchema),
  })

  const { data: studentInfo, refetch } = trpc.student.getStudentInfo.useQuery()
  const { mutate: joinMentorship, isPending: isJoining } =
    trpc.student.joinMentorship.useMutation({
      onSuccess: () => {
        refetch()
      },
      onError: (e) => {
        form.setError("email", { message: e.message })
      },
    })

  const student = useMemo(() => studentInfo?.student, [studentInfo])

  if (student) {
    return (
      <div>
        <div className="flex items-center gap-5">
          <Image
            src={student.mentor?.user?.image ?? "/placeholder.svg"}
            alt={student.mentor?.user?.name ?? "Mentor"}
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-xl object-cover ring-1 ring-[var(--ph-line-strong)]"
          />

          <div className="min-w-0">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ph-muted)]">
              Your mentor
            </p>
            <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight">
              {student.mentor?.user?.name}
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-[var(--ph-muted)]">
          Your squad channel is open. Introduce yourself, then bring whatever
          you are stuck on.
        </p>

        <Button
          className="group mt-8 h-12 rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] px-8 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:opacity-95"
          asChild
        >
          <Link
            href={`https://discord.com/channels/${studentInfo?.serverId}/${student.mentor?.discussionChannelId}`}
          >
            Open your channel
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={form.handleSubmit((values) => joinMentorship(values))}
        className="max-w-md"
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
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Your course email"
                  className="h-12 rounded-xl border-[var(--ph-line-strong)] bg-[var(--ph-bg-soft)] px-4 text-base"
                  autoComplete="email"
                  type="email"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            disabled={isJoining}
            className="h-12 self-start rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] px-8 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:opacity-95"
          >
            {isJoining && <Loader2 className="size-4 animate-spin" />}
            Join Mentorship Program
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-[var(--ph-muted)]">
        Enter the email you enrolled with. We use it to find your batch and your
        mentor, then add you to Discord automatically.
      </p>
    </div>
  )
}

export default StudentJoinForm
