"use client"

import { SidebarLink } from "@/components/sidebar-link"
import { trpc } from "@/trpc/client"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: batches } = trpc.admin.batches.useQuery()

  return (
    <div className="grid grid-cols-5 gap-5">
      <aside className="col-span-1 border-r">
        <ul className="flex flex-col gap-2">
          <li>
            <SidebarLink href="/mentor">Dashboard</SidebarLink>
          </li>
          <li>
            <Link href={`/mentor/students/${batches?.[0]?.id}`}>Students</Link>
            <div className="ml-3 px-3 border-l-2 mt-2">
              {batches?.map((batch) => (
                <SidebarLink
                  key={batch.id}
                  href={`/mentor/students/${batch.id}`}
                >
                  {batch.name}
                </SidebarLink>
              ))}
            </div>
          </li>
        </ul>
      </aside>
      <main className="col-span-4">{children}</main>
    </div>
  )
}
