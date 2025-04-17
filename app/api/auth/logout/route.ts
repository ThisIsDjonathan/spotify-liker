import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear the session cookie
  const cookieStore = await cookies();
  cookieStore.delete("session_token");

  // Redirect to the home page
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
