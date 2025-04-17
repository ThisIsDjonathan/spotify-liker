import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

// Environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ""
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ""
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/api/auth/callback"
const JWT_SECRET = process.env.JWT_SECRET || "spotify-liker-secret-key"

// Scopes needed for the application
const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ")

// Generate a random state for OAuth security
export function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Get the Spotify authorization URL
export function getAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    scope: SPOTIFY_SCOPES,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

// Exchange the code for access and refresh tokens
export async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  })

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens")
  }

  return response.json()
}

// Refresh the access token
async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  })

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh access token")
  }

  return response.json()
}

// Create a JWT token for the session
export async function createSessionToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

// Verify a JWT token
async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (error) {
    return null
  }
}

// Get the current session from cookies
export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const session = await verifySessionToken(sessionToken)
  return session
}

// Get the Spotify API client with the current access token
export async function getSpotifyApi() {
  const session = await getSession() as { expires_at?: number; refresh_token?: string; access_token?: string; id?: string; email?: string }

  if (!session) {
    console.warn(`No session found`);
    return null;
  }

  // Check if the token is expired and refresh if needed
  const now = Math.floor(Date.now() / 1000)
  if (typeof session.expires_at === "number" && session.expires_at < now) {
    try {
      const refreshedTokens = await refreshAccessToken(session.refresh_token as string)

      // Update the session with new tokens
      const newSession = {
        ...session,
        access_token: refreshedTokens.access_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      }

      // Create a new session token
      const newSessionToken = await createSessionToken(newSession)

      // Set the new session token in cookies
      const cookieStore = await cookies()
      // Use a response object or a library like 'cookie' to set cookies
      // Example using 'cookie' library:
      const cookieHeader = `session_token=${newSessionToken}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
      // Add this header to your response object in your API route
      console.log("Set-Cookie:", cookieHeader)

      return {
        accessToken: refreshedTokens.access_token,
        userId: session.id,
        email: session.email,
      }
    } catch (error) {
      console.error("Failed to refresh token:", error)
      return null
    }
  }

  return {
    accessToken: session.access_token as string,
    userId: session.id as string,
    email: session.email as string,
  }
}

// Get user profile from Spotify
export async function getUserProfile(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }

  return response.json()
}
