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

const page = () => {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Users</h1>
      {isPending && <p className="mb-3">Loading...</p>}
      {users && <p>Total: {users.length}</p>}
      <Table className="mt-5 border-2">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
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
