import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuth } from "./lib/auth"
import { headers } from "next/headers"
import { prisma } from "./lib/prisma"

export async function proxy(request: NextRequest) {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const user = session.user

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !["admin", "superadmin"].includes(user.role)
  ) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["admin", "superadmin"] } },
    })

    if (admins.length === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "superadmin" },
      })

      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.redirect(new URL("/", request.url))
  }

  if (
    request.nextUrl.pathname.startsWith("/mentor") &&
    !["admin", "mentor"].includes(user.role)
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/mentor", "/admin", "/admin/:path*", "/mentor/:path*"],
}
