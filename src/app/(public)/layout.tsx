import Header from "@/components/header"
import Image from "next/image"

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-svh bg-[var(--ph-bg)] text-[var(--ph-text)]">
      {/* Atmosphere: brand halo, engineering grid, film grain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden"
      >
        <div className="absolute inset-0 ph-halo" />
        <div className="absolute inset-0 ph-grid opacity-70" />
        <div className="absolute inset-0 ph-grain opacity-[0.035] mix-blend-overlay" />
      </div>

      <div className="relative flex min-h-svh flex-col">
        <Header />

        <main className="flex-1">{children}</main>

        <footer className="mt-24 border-t border-[var(--ph-line)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
            <div className="flex items-center gap-3">
              <Image
                src="/ph.jpeg"
                alt="Programming Hero"
                width={28}
                height={28}
                className="rounded-md"
              />
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--ph-muted)]">
                Programming Hero — Mentorship
              </p>
            </div>

            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--ph-muted)] sm:ml-auto">
              One to one mentorship, run on Discord
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default PublicLayout
