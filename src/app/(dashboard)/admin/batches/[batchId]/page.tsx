"use client"

import { DashboardPageWrapper } from "@/components/dashboard-page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { useParams } from "next/navigation"

const page = () => {
  const { batchId } = useParams()

  const { data: batch } = trpc.batch.batchInfo.useQuery({
    batchId: batchId as string,
  })

  if (!batch) return

  return (
    <DashboardPageWrapper pageTitle={"Batch Details"}>
      <div className="@container">
        <div className="grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-3 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{batch.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="flex items-center justify-between">
                <strong>Discord Server:</strong>
                <Link
                  className="bg-indigo-500/30 text-indigo-500 p-1 rounded-md hover:underline"
                  href={`https://discord.com/channels/${batch.discordServerId}`}
                >
                  {batch.discord.name}
                </Link>
              </p>

              <p className="flex items-center justify-between">
                <strong>Mentors:</strong> {batch.mentors}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl">{batch.assignedStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Joined Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl">{batch.joinedStudents}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageWrapper>
  )
}

export default page
