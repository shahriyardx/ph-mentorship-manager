"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { trpc } from "@/trpc/client"
import { AddInstructorDialog } from "./add-instructor-dialog"
import {
  ArrowRight,
  Search,
  TablePropertiesIcon,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const page = () => {
  const [search, setSearch] = useState("")
  const [batchOverride, setBatchOverride] = useState<string | undefined>()

  const { data: batches } = trpc.admin.batches.useQuery()

  // The current batch is picked for you; you can switch to any other.
  const currentBatch = batches?.find((batch) => batch.isCurrent)
  const selectedBatch = batchOverride ?? currentBatch?.id

  const {
    data: instructors,
    isPending,
    refetch,
  } = trpc.admin.instructors.useQuery(
    { batchId: selectedBatch },
    { enabled: !!selectedBatch },
  )

  const isDefaultView = !batchOverride && !search

  const filtered = useMemo(() => {
    if (!instructors) return []
    if (!search) return instructors

    const q = search.toLowerCase()
    return instructors.filter(
      (instructor) =>
        instructor.user.name.toLowerCase().includes(q) ||
        instructor.user.email.toLowerCase().includes(q),
    )
  }, [instructors, search])

  return (
    <DashboardPageWrapper
      pageTitle="Instructors"
      description="Instructors in this batch, and how their squads are filling up."
      actions={<AddInstructorDialog onSuccessAction={refetch} />}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search name or email"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={selectedBatch} onValueChange={setBatchOverride}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                    {batch.isCurrent ? " (current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isDefaultView && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("")
                  setBatchOverride(undefined)
                }}
              >
                Reset
              </Button>
            )}
          </div>

          <p className="text-muted-foreground text-sm tabular-nums">
            {filtered.length} of {instructors?.length ?? 0} instructors
          </p>
        </div>

        {!selectedBatch ? (
          <EmptyState
            icon={TablePropertiesIcon}
            title="Please select a batch first"
            description={
              batches && batches.length === 0
                ? "There are no batches yet. Create one, then add instructors to it."
                : "No batch is marked as current, so pick one from the dropdown above."
            }
          />
        ) : isPending ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title={
              !isDefaultView
                ? "No instructors match those filters"
                : "No instructors in this batch yet"
            }
            description={
              !isDefaultView
                ? "Try a different search, or reset the filters."
                : "Add your first instructor and their Discord channels are created for them."
            }
            action={
              isDefaultView ? (
                <AddInstructorDialog onSuccessAction={refetch} />
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Instructor</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="w-0 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((instructor) => {
                  const assigned = instructor._count.students
                  const joined = instructor.joined
                  const pct =
                    assigned > 0 ? Math.round((joined / assigned) * 100) : 0

                  return (
                    <TableRow key={instructor.id}>
                      <TableCell>
                        <span className="block font-medium">
                          {instructor.user.name}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {instructor.user.email}
                        </span>

                        <div className="mt-2 flex max-w-48 items-center gap-2">
                          <span
                            aria-hidden
                            className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
                          >
                            <span
                              className="block h-full rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)]"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {instructor.batch ? (
                          <Badge variant="secondary">
                            {instructor.batch.name}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-500/15 text-amber-400"
                          >
                            No batch
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {assigned}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-400">
                        {joined}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/instructors/${instructor.id}`}>
                              Open
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  )
}

export default page
