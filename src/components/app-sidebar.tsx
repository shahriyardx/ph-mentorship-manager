"use client"

import type * as React from "react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { NavAdmin } from "./nav-admin"
import { NavMentor } from "./nav-mentor"
import { usePathname } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data } = authClient.useSession()
  const role = data?.user?.role || "user"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/ph.jpeg"
                    alt="Mentorship Logo"
                    width={32}
                    height={32}
                    className="rounded-md"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mentorship</span>
                  <span className="truncate text-xs">v1.0</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {(role === "admin" || role === "superadmin") && <NavAdmin />}
        {pathname.startsWith("/mentor") &&
          ["admin", "superadmin", "mentor"].includes(role) && <NavMentor />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
