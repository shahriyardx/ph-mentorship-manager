import { ShowIfNotAuthenticated, SignIn } from "@/components/auth-components"
import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"

const page = () => {
  return (
    <div>
      <Header />
      <Separator className="my-5" />
      <p className="mt-3 text-muted-foreground">
        Welcome to the Mentorship Program. You are assigned to a mentor for
        personal mentorship. You will receive guidance and support from your
        mentor.
      </p>

      <ShowIfNotAuthenticated>
        <SignIn />
      </ShowIfNotAuthenticated>
    </div>
  )
}

export default page
