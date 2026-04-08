"use client"

import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

export const SidebarLink = ({
  href,
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <div className="flex gap-2 items-center">
      {isActive && <span className="hidden md:inline-block">-</span>}
      <Link
        href={href}
        {...props}
        className={isActive ? "font-bold underline md:no-underline" : ""}
      >
        {children}
      </Link>
    </div>
  )
}
