"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { trpc } from "@/trpc/client"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

const page = () => {
  const router = useRouter()
  const { data } = authClient.useSession()
  const { mutate: applyForMentor } = trpc.mentor.applyForMentor.useMutation({
    onSuccess: () => {
      toast.success("Mentorship application submitted successfully")
    },
  })

  useEffect(() => {
    if (!data) return

    if (data.user.role === "mentor") {
      router.push("/mentor")
    } else if (data.user.role === "admin") {
      router.push("/admin")
    }

    if (data.user.role === "user") {
      applyForMentor()
    }
  }, [data, router, applyForMentor])

  return (
    <div>
      <div className="max-w-sm w-full mx-auto p-10 border-2 bg-secondary rounded-md mt-20 ">
        {data ? (
          <div>
            <h1 className="mt-4 text-2xl font-bold">
              Welcome, {data.user.name}!
            </h1>
            <p className="text-muted-foreground mt-3">
              Your mentorship application has been submitted successfully.
              Please wait for an admin to approve your application.
            </p>
            <Button
              onClick={() => authClient.signOut()}
              className="p-6 w-full rounded-full mt-10 text-lg bg-indigo-500 text-white"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="text-center flex flex-col justify-center items-center">
            <Shield size={40} />
            <h1 className="mt-4 text-2xl font-bold">Mentor Login</h1>
            <p className="text-muted-foreground mt-3">
              Login with discord to apply for a mentor account, Once approved,
              you will be notified.
            </p>

            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "discord",
                  callbackURL: "/",
                })
              }
              className="p-6 w-full rounded-full mt-10 text-lg bg-indigo-500 text-white"
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default page
