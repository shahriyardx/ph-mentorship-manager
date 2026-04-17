"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Box,
  Settings,
  ShieldUser,
  TablePropertiesIcon,
  Users,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavAdmin() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/admin"} asChild>
            <Link href="/admin">
              <Box />
              Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/admin/batches"} asChild>
            <Link href="/admin/batches">
              <TablePropertiesIcon />
              Batches
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/admin/students"} asChild>
            <Link href="/admin/students">
              <UsersRound />
              Students
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/admin/users"} asChild>
            <Link href="/admin/users">
              <Users />
              Users
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/admin/settings"} asChild>
            <Link href="/admin/settings">
              <Settings />
              Settings
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
