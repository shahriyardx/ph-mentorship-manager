"use client"

import Image from "next/image"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"

export const SignIn = () => {
  return (
    <div className="mt-5 border-2 rounded-md p-5">
      <h1 className="text-2xl font-bold">Sign in to continue</h1>
      <p className="mt-2 text-muted-foreground">
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
        variant="default"
        size="lg"
        className="mt-5"
        onClick={() =>
          authClient.signIn.social({
            provider: "discord",
            callbackURL: "/",
          })
        }
      >
        <Image src="/discord.svg" alt="Sign In" width={14} height={14} />
        Sign In with Discord
      </Button>
    </div>
  )
}

export const SignOut = ({ className }: { className?: string }) => {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={() => authClient.signOut()}
      className={className}
    >
      Logout
    </Button>
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
