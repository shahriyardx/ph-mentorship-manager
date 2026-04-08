import SettingsForm from "@/components/forms/settings-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const page = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
        <CardFooter>
          <Button type="submit" form="settings-form">
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default page
