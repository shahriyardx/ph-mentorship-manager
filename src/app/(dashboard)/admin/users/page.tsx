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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import ConditionalRender from "@/components/conditional-render"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const page = () => {
  const [search, setSearch] = useState("")

  const { data: users, isPending, refetch } = trpc.admin.users.useQuery()
  const { mutate: updateRole } = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const filteredUsers = useMemo(() => {
    if (!users) return []
    if (!search) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search, users])

  return (
    <DashboardPageWrapper pageTitle="Users">
      <div>
        {isPending && <p className="mb-2">Loading...</p>}

        <div className="flex items-center justify-between">
          {users && <p>Total: {users.length}</p>}
          <Input
            placeholder="Name or Email"
            className="w-full max-w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table className="mt-2 border-2">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === "superadmin" ? "admin" : user.role}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      updateRole({ userId: user.id, role: value })
                    }
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
