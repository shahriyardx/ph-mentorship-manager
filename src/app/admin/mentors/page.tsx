"use client"

import { trpc } from "@/trpc/client"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AddStudentsForMentorForm from "@/components/forms/add-students-for-mentor"

const page = () => {
  const { data: mentors, isPending } = trpc.admin.mentors.useQuery()
  const trpcUtils = trpc.useUtils()
  const { mutate: deleteMentor } = trpc.admin.deleteMentor.useMutation({
    onSuccess: () => {
      trpcUtils.admin.mentors.invalidate()
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mentors</h1>
      {isPending && <p>Loading...</p>}

      <Table className="border-2">
        <TableCaption>A list of all mentors</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assgined Students</TableHead>
            <TableHead>Joined Students</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors?.map((mentor) => (
            <TableRow key={mentor.id}>
              <TableCell>{mentor.name}</TableCell>
              <TableCell>{mentor.email}</TableCell>
              <TableCell>{mentor._count.studentsDatas}</TableCell>
              <TableCell>{mentor._count.students}</TableCell>
              <TableCell className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add Students</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Students</DialogTitle>
                      <DialogDescription>
                        <p>
                          <span className="font-bold">Mentor: </span>{" "}
                          {mentor.name}
                        </p>
                        <p>
                          <span className="font-bold">Email: </span>
                          {mentor.email}
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                    <AddStudentsForMentorForm mentor={mentor} />
                    <DialogFooter>
                      <Button type="submit" form="add-students-for-mentor">
                        Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger>
                    <Button variant="destructive">Delete</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the batch and remove all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => deleteMentor({ id: mentor.id })}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default page
