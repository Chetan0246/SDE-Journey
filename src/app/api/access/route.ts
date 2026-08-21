import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { key } = await req.json() as { key: string }
  const validKey = process.env.ACCESS_KEY || "sde2027"

  if (key !== validKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("sde_access", key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })

  return NextResponse.json({ ok: true })
}