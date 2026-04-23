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
  const [role, setRole] = useState<string | null>(null)
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

    const searched = search
      ? users.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()),
        )
      : users

    if (!role) return searched

    return searched.filter((user) => user.role === role)
  }, [search, users, role])

  return (
    <DashboardPageWrapper pageTitle="Users">
      <div>
        {isPending && <p className="mb-2">Loading...</p>}

        <div className="flex items-center justify-between">
          {filteredUsers && <p>Total: {filteredUsers.length}</p>}
          <div className="flex gap-2">
            <Input
              placeholder="Name or Email"
              className="w-full max-w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select onValueChange={(value) => setRole(value)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select Role" />
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
          </div>
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
                    defaultValue={user.role}
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
