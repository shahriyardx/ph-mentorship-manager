"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/trpc/client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { StudentTable } from "@/components/student-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Search, UsersRound } from "lucide-react"
import { toast } from "sonner"

const page = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [batchOverride, setBatchOverride] = useState<string | undefined>()

  const { data: batches } = trpc.admin.batches.useQuery()

  // Default to whichever batch is marked current, so the page is useful on open.
  const currentBatch = batches?.find((batch) => batch.isCurrent)
  const selectedBatch = batchOverride ?? currentBatch?.id

  const hasFilter = searchTerm.length > 0 || !!selectedBatch

  const {
    data: students,
    refetch,
    isFetching,
  } = trpc.admin.studentsByMentor.useQuery(
    {
      batchId: selectedBatch,
      email: searchTerm,
    },
    { enabled: hasFilter },
  )

  const { mutate: deleteStudent, isPending: isDeletingStudent } =
    trpc.admin.deleteStudent.useMutation({
      onSuccess: () => {
        toast.success("Student removed")
        refetch()
      },
      onError: (error) => toast.error(error.message),
    })

  const { mutate: exportStudents, isPending: isExporting } =
    trpc.admin.exportStudents.useMutation({
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

  const rows = students ?? []
  const joinedRows = rows.filter((student) => student.userId)
  const notJoinedRows = rows.filter((student) => !student.userId)

  const clearFilters = () => {
    setSearchTerm("")
    setBatchOverride(undefined)
  }

  const noFilterState = (
    <EmptyState
      icon={Search}
      title="Please select a batch first"
      description="No batch is marked as current, so pick one above. You can also search by email to find one student across every batch."
    />
  )

  return (
    <DashboardPageWrapper
      pageTitle="Students"
      description="Everyone in the batch, and who has actually joined Discord."
      actions={
        selectedBatch && (
          <>
            <Button
              variant="outline"
              disabled={isExporting}
              onClick={() =>
                exportStudents({ type: "joined", batchId: selectedBatch })
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
                exportStudents({ type: "notJoined", batchId: selectedBatch })
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
        )
      }
    >
      <Tabs defaultValue="assigned" className="space-y-4">
        {/* Toolbar: tabs on the left, filters on the right, one row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="assigned">
              Assigned
              <Badge variant="secondary" className="ml-2 tabular-nums">
                {rows.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="joined">
              Joined
              <Badge variant="secondary" className="ml-2 tabular-nums">
                {joinedRows.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by email"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {(searchTerm || batchOverride) && (
              <Button variant="ghost" onClick={clearFilters}>
                Reset
              </Button>
            )}

            {isFetching && (
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            )}
          </div>
        </div>

        {!hasFilter
          ? noFilterState
          : (
              [
                ["assigned", rows],
                ["joined", joinedRows],
                ["notJoined", notJoinedRows],
              ] as const
            ).map(([value, list]) => (
              <TabsContent key={value} value={value}>
                {list.length === 0 ? (
                  <EmptyState
                    icon={UsersRound}
                    title="Nothing here yet"
                    description="Import students into this batch, then assign them to an instructor."
                  />
                ) : (
                  <StudentTable
                    students={list}
                    actions={(student) => (
                      <DeleteDialog
                        name={student.name || student.email}
                        isDeleting={isDeletingStudent}
                        onConfirm={() => deleteStudent({ id: student.id })}
                      />
                    )}
                  />
                )}
              </TabsContent>
            ))}
      </Tabs>
    </DashboardPageWrapper>
  )
}

const DeleteDialog = ({
  name,
  isDeleting,
  onConfirm,
}: {
  name: string
  isDeleting: boolean
  onConfirm: () => void
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button size="sm" variant="ghost" className="text-destructive">
        Remove
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove {name}?</DialogTitle>
        <DialogDescription>
          This deletes the record from the database. It does not remove them
          from Discord, and it cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting && <Loader2 className="size-4 animate-spin" />}
          Remove
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default page
