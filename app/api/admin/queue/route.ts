import { QueueService } from "@/lib/queueService";
import { NextResponse } from "next/server";
import { basicAuth } from "@/app/api/authMiddleware";

export async function GET(request: Request) {
  try {
    const authResponse = basicAuth(request);
    if (authResponse) return authResponse;

    const queueService = new QueueService();
    const queueLength = await queueService.getQueueLength();
    return NextResponse.json(queueLength, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
