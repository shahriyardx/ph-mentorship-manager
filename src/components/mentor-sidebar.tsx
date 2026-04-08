"use client"

import { SidebarLink, SidebarTextLink } from "./sidebar-link"
import { trpc } from "@/trpc/client"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "./ui/button"
import { ChevronsUpDown } from "lucide-react"

export const MentorSidebar = () => {
  const { data: batches } = trpc.admin.batches.useQuery()

  return (
    <div className="flex flex-col gap-2">
      <SidebarLink href="/mentor">Dashboard</SidebarLink>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant={"ghost"} className="w-full">
            Students
            <ChevronsUpDown className="ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {batches && batches.length > 0 && (
            <ul className="ml-2 border-l-2">
              {batches.map((batch) => (
                <li key={batch.id}>
                  <SidebarTextLink href={`/mentor/students/${batch.id}`}>
                    {batch.name}
                  </SidebarTextLink>
                </li>
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
