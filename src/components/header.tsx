"use client"

import { ShowIfNotAuthenticated } from "@/components/auth-components"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const Header = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { data } = authClient.useSession()

  return (
    <header>
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ph.jpeg"
            alt="PH"
            width={30}
            height={30}
            className="rounded-md"
          />

          <h1 className="hidden sm:block text-2xl font-bold">
            Mentorship Program
          </h1>
        </Link>
        <div className="ml-auto flex gap-2">
          {data && (
            <>
              {pathname.startsWith("/admin") ||
              pathname.startsWith("/mentor") ? null : (
                <>
                  {["admin", "superadmin"].includes(data.user.role) && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  )}

                  {data.user.role === "mentor" && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/mentor">Mentor Dashboard</Link>
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="destructive"
                size="lg"
                onClick={async () => {
                  await authClient.signOut()
                  router.push("/")
                }}
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
