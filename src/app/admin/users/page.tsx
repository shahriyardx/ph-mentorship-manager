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

const page = () => {
  const [search, setSearch] = useState("")
  const { data: users, isPending, refetch } = trpc.admin.users.useQuery()
  const { mutate: makeAdmin } = trpc.admin.makeAdmin.useMutation({
    onSuccess: () => {
      refetch()
    },
  })
  const { mutate: removeAdmin } = trpc.admin.removeAdmin.useMutation({
    onSuccess: () => {
      refetch()
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
    <div>
      <h1 className="text-2xl font-bold mb-3">Users</h1>
      {isPending && <p className="mb-3">Loading...</p>}

      <div className="mt-5 flex items-center  justify-between">
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
              <TableCell>
                {user.role === "superadmin" ? (
                  <span className="text-muted-foreground">Not available</span>
                ) : ["mentor", "user"].includes(user.role) ? (
                  <Button onClick={() => makeAdmin({ userId: user.id })}>
                    Make Admin
                  </Button>
                ) : (
                  <Button onClick={() => removeAdmin({ userId: user.id })}>
                    Remove Admin
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page
