"use client"

import { ShowIfNotAuthenticated } from "@/components/auth-components"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogInIcon } from "lucide-react"

const Header = () => {
  const pathname = usePathname()
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
            <div>
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
            </div>
          )}

          <ShowIfNotAuthenticated>
            <Button
              onClick={() => authClient.signIn.social({ provider: "discord" })}
            >
              <LogInIcon />
              Login
            </Button>
          </ShowIfNotAuthenticated>
          {data && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={data.user.image ?? undefined}
                    alt={data.user.name ?? undefined}
                  />
                  <AvatarFallback>{data.user.name?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Profile</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => authClient.signOut()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
