"use client"

import { SidebarLink } from "./sidebar-link"
import { trpc } from "@/trpc/client"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export const MentorSidebar = () => {
  const { data: batches } = trpc.admin.batches.useQuery()

  return (
    <ul className="flex flex-col gap-2">
      <li>
        <SidebarLink href="/mentor">Dashboard</SidebarLink>
      </li>
      <li>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <p>Students</p>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {batches && batches.length > 0 && (
              <ul className="ml-3 pl-3 border-l">
                {batches.map((batch) => (
                  <li key={batch.id}>
                    <SidebarLink href={`/mentor/students/${batch.id}`}>
                      {batch.name}
                    </SidebarLink>
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      </li>
    </ul>
  )
}
