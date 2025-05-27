import { NextResponse } from "next/server";
import { Job, Queue } from "bullmq";
import { Redis } from "ioredis";
import { AppError } from "@/types/AppError";

const connection = new Redis(process.env.REDIS_HOST!);
const queue = new Queue("like-songs-queue", { connection });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId || isNaN(Number(jobId))) {
      throw new AppError({
        message: "Job ID is required and must be a number",
        statusCode: 400,
      });
    }

    const job = await Job.fromId(queue, jobId);
    if (!job) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      status: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
