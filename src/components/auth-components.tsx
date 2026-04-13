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
    <div className="mt-5 border-2 rounded-md p-10 text-center">
      {error && (
        <Alert className="mb-5" variant="destructive">
          {errorMessage}
        </Alert>
      )}

      <h1 className="text-xl sm:text-2xl font-bold">Sign in to continue</h1>
      <p className="mt-2 text-muted-foreground text-sm sm:text-base">
        Before you can access the mentorship program, please sign in with your
        Discord account. If you don't have an account, you can create one for
        free from{" "}
        <a
          target="_blank"
          href="https://discord.com"
          className="text-primary"
          rel="noopener"
        >
          Discord.com
        </a>
        .
      </p>
      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
            callbackURL: "/",
            errorCallbackURL: "/",
          })
        }
        className="p-6 rounded-full bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600 w-full mt-5"
      >
        Sign In with Discord
      </Button>
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
