"use client"

import { trpc } from "@/trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Users } from "lucide-react"
import { toast } from "sonner"

const ROLES = ["user", "mentor", "admin", "superadmin"] as const

const ROLE_STYLES: Record<string, string> = {
  user: "bg-muted text-muted-foreground border-transparent",
  mentor:
    "bg-[var(--ph-brand)]/15 text-[var(--ph-brand-2)] border-[var(--ph-brand)]/40",
  admin: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  superadmin: "bg-amber-500/15 text-amber-400 border-amber-500/40",
}

const page = () => {
  const [role, setRole] = useState<string>("all")
  const [search, setSearch] = useState("")

  const { data: users, isPending, refetch } = trpc.admin.users.useQuery()
  const { mutate: updateRole, isPending: isUpdating } =
    trpc.admin.updateRole.useMutation({
      onSuccess: () => {
        toast.success("Role updated")
        refetch()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const filteredUsers = useMemo(() => {
    if (!users) return []

    const searched = search
      ? users.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()),
        )
      : users

    if (role === "all") return searched

    return searched.filter((user) => user.role === role)
  }, [search, users, role])

  return (
    <DashboardPageWrapper
      pageTitle="Users"
      description="Everyone who has signed in. Change a role to grant mentor or admin access."
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

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {(search || role !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("")
                  setRole("all")
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <p className="text-muted-foreground text-sm tabular-nums">
            {filteredUsers.length} of {users?.length ?? 0} users
          </p>
        </div>

        {isPending ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match those filters"
            description="Try a different search, or set the role filter back to all."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setRole("all")
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-0 text-right">Change role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.appliedForMentor && user.role === "user" && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-amber-500/40 bg-amber-500/15 text-amber-400"
                        >
                          Applied
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${ROLE_STYLES[user.role]}`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end">
                        <Select
                          value={user.role}
                          disabled={isUpdating || user.role === "superadmin"}
                          onValueChange={(value) =>
                            updateRole({ userId: user.id, role: value })
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ROLES.map((r) => (
                                <SelectItem
                                  key={r}
                                  value={r}
                                  className="capitalize"
                                >
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  )
}

export default page
