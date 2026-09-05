"use client"

import Link from "next/link"
import { trpc } from "@/trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { DeleteBatchDialog } from "./delete-batch-dialog"
import { CreateBatchDialog } from "./create-batch-dialog"
import { EditBatchDialog } from "./edit-batch-dialog"
import { ArrowRight, Search, TablePropertiesIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const page = () => {
  const [search, setSearch] = useState("")

  const { data: batches, isPending, refetch } = trpc.admin.batches.useQuery()

  const { mutate: deleteBatch, isPending: isDeleting } =
    trpc.admin.deleteBatch.useMutation({
      onSuccess: () => {
        toast.success("Batch deleted")
        refetch()
      },
      onError: (error) => toast.error(error.message),
    })

  const { mutate: setCurrentBatch } = trpc.admin.setCurrentBatch.useMutation({
    onSuccess: () => {
      toast.success("Current batch updated")
      refetch()
    },
    onError: (error) => toast.error(error.message),
  })

  const filtered = useMemo(() => {
    if (!batches) return []
    if (!search) return batches

    return batches.filter((batch) =>
      batch.name.toLowerCase().includes(search.toLowerCase()),
    )
  }, [batches, search])

  return (
    <DashboardPageWrapper
      pageTitle="Batches"
      description="Each batch has its own mentors, students and Discord channels."
      actions={<CreateBatchDialog />}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search batches"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <p className="text-muted-foreground text-sm tabular-nums">
            {filtered.length} of {batches?.length ?? 0} batches
          </p>
        </div>

        {isPending ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={TablePropertiesIcon}
            title={search ? "No batches match that search" : "No batches yet"}
            description={
              search
                ? "Try a different name, or clear the search box."
                : "Create your first batch, then add mentors and import students into it."
            }
            action={search ? undefined : <CreateBatchDialog />}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="w-0 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((batch) => {
                  const assigned = batch._count.students
                  const joined = batch.joined
                  const pct =
                    assigned > 0 ? Math.round((joined / assigned) * 100) : 0

                  return (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{batch.name}</span>
                          {batch.isCurrent && (
                            <Badge className="border-[var(--ph-brand)]/40 bg-[var(--ph-brand)]/15 text-[var(--ph-brand-2)]">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 flex max-w-56 items-center gap-2">
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

                      <TableCell className="text-right tabular-nums">
                        {assigned}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-400">
                        {joined}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!batch.isCurrent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCurrentBatch({ id: batch.id })}
                            >
                              Set as current
                            </Button>
                          )}

                          <EditBatchDialog
                            batch={batch}
                            onSuccessAction={refetch}
                          />

                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/batches/${batch.id}`}>
                              Open
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>

                          <DeleteBatchDialog
                            batchId={batch.id}
                            isDeleting={isDeleting}
                            deleteBatch={deleteBatch}
                          />
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
