"use client"

import { trpc } from "@/trpc/client"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { StudentTable } from "@/components/student-table"
import { Download, Loader2, Search, UsersRound } from "lucide-react"
import { toast } from "sonner"

const page = () => {
  const { batchId } = useParams()
  const [search, setSearch] = useState("")

  const { data, isPending } = trpc.mentor.students.useQuery({
    batchId: batchId as string,
  })

  const students = useMemo(() => data?.students ?? [], [data])

  const { mutate: exportStudents, isPending: isExporting } =
    trpc.mentor.exportStudents.useMutation({
      onSuccess: (file) => {
        const link = document.createElement("a")
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${file.base64}`
        link.download = file.filename
        link.click()
        link.remove()
        toast.success("Export downloaded")
      },
      onError: (error) => toast.error(error.message),
    })

  const matches = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().includes(search.toLowerCase())

  const filtered = students.filter(
    (s) => !search || matches(s.name) || matches(s.email) || matches(s.phone),
  )
  const joined = filtered.filter((s) => s.userId)
  const notJoined = filtered.filter((s) => !s.userId)

  return (
    <DashboardPageWrapper
      pageTitle="Your students"
      description="Everyone assigned to you in this batch, and who has joined Discord."
      actions={
        <>
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() =>
              exportStudents({ type: "joined", batchId: batchId as string })
            }
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export joined
          </Button>
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() =>
              exportStudents({ type: "notJoined", batchId: batchId as string })
            }
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export not joined
          </Button>
        </>
      }
    >
      {isPending ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          {/* Tabs and search share one row. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {filtered.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="joined">
                Joined
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {joined.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="notJoined">
                Not joined
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {notJoined.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search name, email or phone"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {(
            [
              ["all", filtered],
              ["joined", joined],
              ["notJoined", notJoined],
            ] as const
          ).map(([value, rows]) => (
            <TabsContent key={value} value={value}>
              {rows.length === 0 ? (
                <EmptyState
                  icon={UsersRound}
                  title={
                    search ? "Nobody matches that search" : "Nothing here yet"
                  }
                  description={
                    search
                      ? "Try a different name, email or phone number."
                      : "An admin imports the batch, then assigns students to you."
                  }
                />
              ) : (
                <StudentTable students={rows} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </DashboardPageWrapper>
  )
}

export default page
