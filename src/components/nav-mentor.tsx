"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Box, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { trpc } from "@/trpc/client"

export function NavMentor() {
  const pathname = usePathname()
  const { data: batches } = trpc.admin.batches.useQuery()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Mentor</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/mentor"} asChild>
            <Link href="/mentor">
              <Box />
              Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <Collapsible asChild className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <span>Students</span>
                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {batches?.map((batch) => (
                  <SidebarMenuSubItem key={batch.id}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === `/mentor/students/${batch.id}`}
                    >
                      <Link href={`/mentor/students/${batch.id}`}>
                        <span>{batch.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
