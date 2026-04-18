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

const page = () => {
  const [search, setSearch] = useState("")

  const { data: users, isPending, refetch } = trpc.admin.users.useQuery()
  const { mutate: makeAdmin, isPending: isMakingAdmin } =
    trpc.admin.makeAdmin.useMutation({
      onSuccess: () => {
        refetch()
      },
    })
  const { mutate: makeMentor, isPending: isMakingMentor } =
    trpc.admin.makeMentor.useMutation({
      onSuccess: () => {
        refetch()
      },
    })

  const { mutate: makeUser, isPending: isMakingUser } =
    trpc.admin.makeUser.useMutation({
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
                  <ConditionalRender condition={user.role === "superadmin"}>
                    <span className="text-muted-foreground">Not available</span>
                  </ConditionalRender>

                  <ConditionalRender condition={user.role !== "superadmin"}>
                    <ConditionalRender condition={user.role !== "admin"}>
                      <Button
                        variant={"outline"}
                        disabled={isMakingAdmin}
                        onClick={() => makeAdmin({ userId: user.id })}
                      >
                        {isMakingAdmin && <Loader2 className="animate-spin" />}
                        Make Admin
                      </Button>
                    </ConditionalRender>

                    <ConditionalRender
                      condition={
                        user.role === "admin" || user.role === "mentor"
                      }
                    >
                      <Button
                        variant={"outline"}
                        disabled={isMakingUser}
                        onClick={() => makeUser({ userId: user.id })}
                      >
                        {isMakingUser && <Loader2 className="animate-spin" />}
                        Make User
                      </Button>
                    </ConditionalRender>

                    <ConditionalRender
                      condition={user.role === "user" || user.role === "admin"}
                    >
                      <Button
                        variant={"outline"}
                        disabled={isMakingMentor}
                        onClick={() => makeMentor({ userId: user.id })}
                      >
                        {isMakingMentor && <Loader2 className="animate-spin" />}
                        Make Mentor
                      </Button>
                    </ConditionalRender>
                  </ConditionalRender>
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
