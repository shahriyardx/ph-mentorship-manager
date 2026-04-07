"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const page = () => {
  const router = useRouter()
  const { data } = authClient.useSession()
  useEffect(() => {
    if (data?.user.role === "mentor") {
      router.push("/mentor")
    }
  }, [data, router])

  return (
    <div>
      <div className="max-w-sm w-full mx-auto p-10 border-2 bg-secondary rounded-md mt-20 ">
        {data ? (
          <div>
            <h1 className="mt-4 text-2xl font-bold">
              Welcome, {data.user.name}!
            </h1>
            <p className="text-muted-foreground mt-3">
              You are already logged in and waiting for admin approval.
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
              Login with discord and wait for admin to approve your mentorship
              account
            </p>

            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "discord",
                  callbackURL: "/mentor-login",
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
