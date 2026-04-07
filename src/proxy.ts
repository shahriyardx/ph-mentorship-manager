import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuth } from "./lib/auth"
import { headers } from "next/headers"

export async function proxy(request: NextRequest) {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const user = session.user

  if (request.nextUrl.pathname.startsWith("/admin") && user.role !== "admin") {
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
