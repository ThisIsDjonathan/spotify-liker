import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRandomState, getAuthorizationUrl } from "@/lib/spotifyAuth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Generate a random state for OAuth security
    const state = generateRandomState();

    // Store the state in a cookie for verification later
    const cookieStore = await cookies();
    cookieStore.set("spotify_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 60 minutes
    });

    // Get the authorization URL
    const authorizationUrl = getAuthorizationUrl(state);

    // Redirect to Spotify authorization
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Error during Spotify authorization:", error);
    return NextResponse.json(
      { error: "Failed to initiate login process" },
      { status: 500 },
    );
  }
}
