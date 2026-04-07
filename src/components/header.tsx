"use client"

import { SignOut } from "@/components/auth-components"
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

        <h1 className="text-2xl font-bold">
          <Link href="/">Mentorship Program</Link>
        </h1>
        {data && (
          <div className="ml-auto flex gap-2">
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
            <SignOut />
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
