"use client"

import Image from "next/image"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"

export const SignIn = () => {
  return (
    <div className="mt-5 border-2 rounded-md p-10 text-center">
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
