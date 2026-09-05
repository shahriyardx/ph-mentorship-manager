import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TRPCProvider } from "@/trpc/client"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

import { TooltipProvider } from "@/components/ui/tooltip"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Programming Hero Mentorship",
  description:
    "One to one mentorship program for Programming Hero students. Get matched with a dedicated mentor and a private Discord squad.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <TooltipProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
