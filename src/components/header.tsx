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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogInIcon, LogOut } from "lucide-react"

const Header = () => {
  const pathname = usePathname()
  const { data } = authClient.useSession()

  const inDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/mentor")

  // Admins land on the admin dashboard, mentors on theirs, students get nothing.
  const role = data?.user.role
  const dashboardHref = ["admin", "superadmin"].includes(role ?? "")
    ? "/admin"
    : role === "mentor"
      ? "/mentor"
      : null

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
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage
                          src={data.user.image ?? undefined}
                          alt={data.user.name ?? undefined}
                        />
                        <AvatarFallback className="text-xs">
                          {data.user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* min-w-0 lets the email truncate instead of overflowing */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {data.user.name}
                        </p>
                        <p
                          className="text-muted-foreground truncate text-xs"
                          title={data.user.email}
                        >
                          {data.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  {dashboardHref && !inDashboard && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={dashboardHref}>
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => authClient.signOut()}>
                    <LogOut className="size-4" />
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
