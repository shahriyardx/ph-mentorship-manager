"use client"

import { ShowIfNotAuthenticated } from "@/components/auth-components"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

const Header = () => {
  const { data } = authClient.useSession()

  return (
    <header>
      <div className="flex items-center gap-2">
        <Image
          src="/ph.jpeg"
          alt="PH"
          width={30}
          height={30}
          className="rounded-md"
        />

        <h1 className="text-xl sm:text-2xl font-bold">
          <Link href="/">Mentorship Program</Link>
        </h1>
        <div className="ml-auto flex gap-2">
          {data && (
            <>
              {data.user.role === "admin" && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}

              {data.user.role === "mentor" && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/mentor">Mentor Dashboard</Link>
                </Button>
              )}

              <Button
                variant="destructive"
                size="lg"
                onClick={() => authClient.signOut()}
              >
                Logout
              </Button>
            </>
          )}

          <ShowIfNotAuthenticated>
            <Button
              onClick={() => authClient.signIn.social({ provider: "discord" })}
            >
              Login
            </Button>
          </ShowIfNotAuthenticated>
        </div>
      </div>
    </header>
  )
}

export default Header
