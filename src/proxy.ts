import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAccessPage = pathname === "/access"
  const cookieKey = request.cookies.get("sde_access")?.value
  const validKey = process.env.ACCESS_KEY || "sde2027"

  if (isAccessPage) {
    if (cookieKey === validKey) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (cookieKey !== validKey) {
    return NextResponse.redirect(new URL("/access", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}