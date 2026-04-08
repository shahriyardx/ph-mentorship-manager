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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddMentorFormBase } from "@/components/forms/add-mentor-form"
import { Loader2 } from "lucide-react"
import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"

const page = () => {
  const [search, setSearch] = useState("")
  const [isMakingMentor, setIsMakingMentor] = useState(false)

  const { data: users, isPending, refetch } = trpc.admin.users.useQuery()
  const { mutate: makeAdmin, isPending: isMakingAdmin } =
    trpc.admin.makeAdmin.useMutation({
      onSuccess: () => {
        refetch()
      },
    })
  const { mutate: removeAdmin, isPending: isRemovingAdmin } =
    trpc.admin.removeAdmin.useMutation({
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
                  {user.role === "superadmin" ? (
                    <span className="text-muted-foreground">Not available</span>
                  ) : ["mentor", "user"].includes(user.role) ? (
                    <Button
                      variant={"outline"}
                      disabled={isMakingAdmin}
                      onClick={() => makeAdmin({ userId: user.id })}
                    >
                      {isMakingAdmin && <Loader2 className="animate-spin" />}
                      Make Admin
                    </Button>
                  ) : (
                    <Button
                      variant={"destructive"}
                      disabled={isRemovingAdmin}
                      onClick={() => removeAdmin({ userId: user.id })}
                    >
                      {isRemovingAdmin && <Loader2 className="animate-spin" />}
                      Remove Admin
                    </Button>
                  )}

                  {user.role === "user" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant={"outline"}>Make Mentor</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make Mentor</DialogTitle>
                          <DialogDescription>
                            You are about to make {user.name} a mentor.
                          </DialogDescription>
                        </DialogHeader>

                        <AddMentorFormBase
                          userId={user.id}
                          onSubmit={() => setIsMakingMentor(true)}
                          onSuccess={() => {
                            setIsMakingMentor(false)
                            refetch()
                          }}
                        />

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant={"outline"}>Cancel</Button>
                          </DialogClose>
                          <Button
                            disabled={isMakingMentor}
                            type="submit"
                            form="add-mentor-form"
                          >
                            {isMakingMentor && (
                              <Loader2 className="animate-spin" />
                            )}
                            Submit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
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
