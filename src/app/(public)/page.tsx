import {
  ShowIfAuthenticated,
  ShowIfNotAuthenticated,
  SignIn,
} from "@/components/auth-components"
import StudentJoinForm from "@/components/forms/student-join-form"
import { trpc } from "@/trpc/server"
import { MessagesSquare, ShieldCheck, Sparkles, UserRound } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"

const STEPS = [
  {
    n: "01",
    title: "Sign in with Discord",
    body: "One click. We use the same Discord account you will study in, so there is nothing else to set up.",
  },
  {
    n: "02",
    title: "Enter your course email",
    body: "The email you enrolled with. It tells us which batch you are in and which mentor you belong to.",
  },
  {
    n: "03",
    title: "Meet your squad",
    body: "You are pulled into your mentor's private channels straight away. Your mentor is already waiting.",
  },
]

const BENEFITS = [
  {
    icon: UserRound,
    title: "One mentor, not a queue",
    body: "You are assigned to a specific mentor for the whole batch. They learn your name, your project and where you get stuck.",
  },
  {
    icon: MessagesSquare,
    title: "A private squad channel",
    body: "A small Discord room for you and a handful of peers. Small enough that asking a question is never intimidating.",
  },
  {
    icon: ShieldCheck,
    title: "Announcements that matter",
    body: "A separate channel your mentor posts to, so deadlines and resources never get lost in the chat.",
  },
  {
    icon: Sparkles,
    title: "Unblocked, faster",
    body: "Bring the bug, the error message or the blank page. Getting moving again is the entire point.",
  },
]

const page = async () => {
  const settings = await trpc.admin.settings()

  if (settings?.maintenanceMode) {
    redirect("/maintenance")
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="ph-rise max-w-3xl pt-20 pb-24 sm:pt-28 lg:pt-32">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ph-muted)]">
          One&nbsp;to&nbsp;one mentorship
        </p>

        <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
          Every student gets a mentor who{" "}
          <em className="not-italic bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] bg-clip-text text-transparent">
            knows their name.
          </em>
        </h1>

        <p className="mt-7 max-w-[54ch] text-base leading-relaxed text-[var(--ph-muted)] sm:text-lg">
          You are matched with a dedicated mentor and a small private Discord
          squad. Ask the question you were too shy to ask in a room of five
          hundred people.
        </p>

        {/* The one action on this page. */}
        <div className="mt-10">
          <ShowIfNotAuthenticated>
            <Suspense
              fallback={
                <div className="h-12 w-64 animate-pulse rounded-full bg-[var(--ph-bg-soft)]" />
              }
            >
              <SignIn />
            </Suspense>
          </ShowIfNotAuthenticated>

          <ShowIfAuthenticated>
            <StudentJoinForm />
          </ShowIfAuthenticated>
        </div>
      </section>

      {/* ------------------------------------------------------------ How it works */}
      <section className="border-t border-[var(--ph-line)] py-20">
        <h2 className="ph-tick font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ph-muted)]">
          How it works
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--ph-line)] bg-[var(--ph-line)] sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="bg-[var(--ph-bg)] p-8 transition-colors duration-300 hover:bg-[var(--ph-bg-soft)]"
            >
              <span className="font-mono text-sm text-[var(--ph-brand-2)]">
                {step.n}
              </span>
              <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ph-muted)]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- Benefits */}
      <section className="border-t border-[var(--ph-line)] py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="ph-tick font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ph-muted)]">
              What you get
            </h2>
            <p className="mt-6 text-3xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-4xl">
              Mentorship that is small on purpose.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title}>
                <benefit.icon
                  className="size-5 text-[var(--ph-brand-2)]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ph-muted)]">
                  {benefit.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default page
