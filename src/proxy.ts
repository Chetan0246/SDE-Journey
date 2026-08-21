import { type NextRequest, NextResponse } from "next/server"

// Rename to 'middleware' instead of 'proxy' as that's the Next.js convention
export function middleware(req: NextRequest) {
  const authUser = process.env.BASIC_AUTH_USER
  const authPass = process.env.BASIC_AUTH_PASS

  // Only enforce auth if the environment variables are set
  if (authUser && authPass) {
    const basicAuth = req.headers.get("authorization")
    
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1]
      const [user, pwd] = atob(authValue).split(":")
      
      if (user === authUser && pwd === authPass) {
        return NextResponse.next()
      }
    }
    
    // Request auth from the browser
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="SDE Journey Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}