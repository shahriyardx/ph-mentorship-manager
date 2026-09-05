"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"
import { useMemo } from "react"
import { Alert } from "./ui/alert"

export const SignIn = () => {
  const params = useSearchParams()
  const error = params.get("error")
  const errorMessage = useMemo(() => {
    if (error === "email_not_found") {
      return "Your Discord account doesn't have an email address. Please add one in your Discord settings and try again."
    }

    return "Something went wrong. Please try again."
  }, [error])

  return (
    <div>
      {error && (
        <Alert className="mb-6 max-w-md" variant="destructive">
          {errorMessage}
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button
          onClick={() =>
            authClient.signIn.social({
              provider: "discord",
              callbackURL: "/",
              errorCallbackURL: "/",
            })
          }
          className="h-12 rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] px-8 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:opacity-95"
        >
          Join Mentorship Program
        </Button>

        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ph-muted)]">
          Takes about 10 seconds
        </p>
      </div>

      <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-[var(--ph-muted)]">
        Use the Discord account you want your mentorship channels on. No account
        yet?{" "}
        <a
          target="_blank"
          href="https://discord.com"
          className="text-[var(--ph-text)] underline decoration-[var(--ph-brand)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--ph-brand-2)]"
          rel="noopener"
        >
          Create one free
        </a>
        .
      </p>
    </div>
  )
}

export const ShowIfAuthenticated = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = authClient.useSession()

  if (!data) return null

  return <>{children}</>
}

export const ShowIfNotAuthenticated = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = authClient.useSession()

  if (data) return null

  return <>{children}</>
}
