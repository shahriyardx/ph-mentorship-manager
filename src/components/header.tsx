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

  const inDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/mentor")

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ph-line)] bg-[color-mix(in_oklab,var(--ph-bg)_78%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative block">
            <span
              aria-hidden
              className="absolute -inset-1 rounded-xl bg-[var(--ph-brand)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"
            />
            <Image
              src="/ph.jpeg"
              alt="Programming Hero"
              width={44}
              height={44}
              className="relative size-11 rounded-xl"
            />
          </span>

          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--ph-muted)]">
              Programming Hero
            </span>
            <span className="mt-1 text-lg font-semibold tracking-tight text-[var(--ph-text)]">
              Mentorship
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {data && !inDashboard && (
            <>
              {["admin", "superadmin"].includes(data.user.role) && (
                <Button
                  variant="outline"
                  asChild
                  className="border-[var(--ph-line-strong)] bg-transparent font-mono text-xs uppercase tracking-[0.14em] hover:bg-[var(--ph-bg-soft)]"
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              )}

              {data.user.role === "mentor" && (
                <Button
                  variant="outline"
                  asChild
                  className="border-[var(--ph-line-strong)] bg-transparent font-mono text-xs uppercase tracking-[0.14em] hover:bg-[var(--ph-bg-soft)]"
                >
                  <Link href="/mentor">Mentor</Link>
                </Button>
              )}
            </>
          )}

          <ShowIfNotAuthenticated>
            <Button
              onClick={() => authClient.signIn.social({ provider: "discord" })}
              className="rounded-full bg-[var(--ph-text)] font-mono text-xs uppercase tracking-[0.14em] text-[var(--ph-bg)] hover:bg-white"
            >
              <LogInIcon className="size-3.5" />
              Sign in
            </Button>
          </ShowIfNotAuthenticated>

          {data && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full ring-1 ring-[var(--ph-line-strong)] transition-shadow hover:ring-[var(--ph-brand)]"
                >
                  <Avatar>
                    <AvatarImage
                      src={data.user.image ?? undefined}
                      alt={data.user.name ?? undefined}
                    />
                    <AvatarFallback>{data.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <span className="block text-sm">{data.user.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {data.user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => authClient.signOut()}>
                    Log out
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
