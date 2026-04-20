import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { trpc } from "@/trpc/server"
import { Construction } from "lucide-react"
import { redirect } from "next/navigation"
import { ReloadButton } from "./reload-button"

const page = async () => {
  const settings = await trpc.admin.settings()
  if (!settings) return null
  if (!settings.maintenanceMode) {
    redirect("/")
  }

  return (
    <div className="grid place-items-center min-h-svh">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="text-yellow-400" /> Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The website is currently undergoing maintenance. Please check back
            after a few minutes. If the issue persists, please contact support.
          </p>
        </CardContent>
        <CardFooter>
          <ReloadButton />
        </CardFooter>
      </Card>
    </div>
  )
}

export default page
