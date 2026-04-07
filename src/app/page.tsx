import {
  ShowIfAuthenticated,
  ShowIfNotAuthenticated,
  SignIn,
} from "@/components/auth-components"
import StudentJoinForm from "@/components/forms/student-join-form"
import Header from "@/components/header"
import { Separator } from "@/components/ui/separator"
import { GraduationCap } from "lucide-react"

const page = () => {
  return (
    <div>
      <Header />
      <Separator className="my-5" />

      <div className="flex justify-center items-center flex-col gap-5">
        <GraduationCap size={40} className="mt-10 text-purple-500" />
        <h1 className="text-4xl  md:text-5xl font-bold mt-3 text-center">
          Mentorship Program
        </h1>
        <p className="text-muted-foreground max-w-[60ch] text-center text-sm sm:text-base">
          You are assigned to a mentor for personal mentorship. You will receive
          guidance and support from your mentor.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-10">
        <ShowIfNotAuthenticated>
          <SignIn />
        </ShowIfNotAuthenticated>

        <ShowIfAuthenticated>
          <StudentJoinForm />
        </ShowIfAuthenticated>
      </div>
    </div>
  )
}

export default page
