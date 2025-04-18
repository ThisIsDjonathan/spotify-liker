import { NextResponse } from "next/server";
import { Redis } from "ioredis";

export async function GET() {
  let redis;
  try {
    redis = new Redis(process.env.REDIS_HOST!);
    const pingResponse = await redis.ping();
    return NextResponse.json(
      { pingResponse, timestamp: new Date() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  } finally {
    redis?.disconnect();
  }
}
