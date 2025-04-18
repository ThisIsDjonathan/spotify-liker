import { NextResponse } from "next/server";
import { Redis } from "ioredis";
import { basicAuth } from "@/app/api/authMiddleware";

export async function GET(request: Request) {
  const authResponse = basicAuth(request);
  if (authResponse) return authResponse;

  let redis;
  try {
    redis = new Redis(process.env.REDIS_HOST!);
    const pingResponse = await redis.ping();
    return NextResponse.json(
      { pingResponse, timestamp: new Date() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  } finally {
    redis?.disconnect();
  }
}
