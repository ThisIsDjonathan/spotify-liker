import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  createSessionToken,
  getUserProfile,
} from "@/lib/spotifyAuth";

export async function GET(request: NextRequest) {
  // Get the URL parameters
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Check for errors
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  // Verify the state parameter
  const storedState = (await cookies()).get("spotify_auth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/?error=state_mismatch", request.url),
    );
  }

  // Clear the state cookie
  (await cookies()).delete("spotify_auth_state");

  // Exchange the code for tokens
  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    // Exchange the code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get the user profile
    const userProfile = await getUserProfile(tokens.access_token);

    // Create a session with the tokens and user info
    const session = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      id: userProfile.id,
      email: userProfile.email,
    };

    // Create a session token
    const sessionToken = await createSessionToken(session);

    // Set the session token in a cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Redirect to the confirmation page instead of home
    return NextResponse.redirect(new URL("/confirmation", request.url));
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.redirect(
      new URL("/?error=authentication_failed", request.url),
    );
  }
}
