import { NextResponse } from "next/server";

const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
  throw new Error("Basic auth credentials are not set in environment variables.");
}

export function basicAuth(request: Request): Response | null {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      }
    );
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = credentials.split(":");

  if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      }
    );
  }

  return null; // No error, proceed with the request
}
