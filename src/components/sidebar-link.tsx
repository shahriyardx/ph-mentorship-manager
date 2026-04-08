"use client"

import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"

export const SidebarLink = ({
  href,
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className="flex gap-2 items-center justify-start md:w-full"
    >
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  )
}

export const SidebarTextLink = ({
  href,
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "link" }),
        isActive && "underline",
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
