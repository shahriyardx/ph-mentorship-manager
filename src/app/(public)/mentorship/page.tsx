"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const page = () => {
  const { data, isPending } = authClient.useSession()

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="ph-rise max-w-2xl pt-20 pb-24 sm:pt-28 lg:pt-32">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ph-muted)]">
          Mentor access
        </p>

        {isPending ? (
          <div className="mt-8 flex items-center gap-3 text-[var(--ph-muted)]">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Checking your session…</span>
          </div>
        ) : data ? (
          <>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
              Signed in as{" "}
              <span className="bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] bg-clip-text text-transparent">
                {data.user.name}
              </span>
            </h1>

            <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-[var(--ph-muted)]">
              {["mentor", "admin", "superadmin"].includes(data.user.role)
                ? "Your account has mentor access. Open the dashboard to see your batches and your students."
                : "This account does not have mentor access yet. Mentor and admin roles are granted by a superadmin — ask yours to add you, then sign in again."}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
              {["mentor", "admin", "superadmin"].includes(data.user.role) && (
                <Button
                  asChild
                  className="h-12 rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] px-8 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:opacity-95"
                >
                  <Link
                    href={
                      ["admin", "superadmin"].includes(data.user.role)
                        ? "/admin"
                        : "/mentor"
                    }
                  >
                    Open dashboard
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => authClient.signOut()}
                className="h-12 rounded-full border-[var(--ph-line-strong)] bg-transparent px-8 text-sm font-medium hover:bg-[var(--ph-bg-soft)]"
              >
                Sign out
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
              Mentor{" "}
              <span className="bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] bg-clip-text text-transparent">
                sign in.
              </span>
            </h1>

            <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-[var(--ph-muted)]">
              Sign in with the Discord account your squad channels belong to.
              Mentor access is granted by a superadmin, so if you were added you
              will land straight on your dashboard.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                onClick={() =>
                  authClient.signIn.social({
                    provider: "discord",
                    callbackURL: "/mentorship",
                  })
                }
                className="h-12 rounded-full bg-gradient-to-r from-[var(--ph-brand)] to-[var(--ph-brand-2)] px-8 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:opacity-95"
              >
                Sign in with Discord
              </Button>

              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--ph-muted)]">
                Mentors and admins only
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default page
