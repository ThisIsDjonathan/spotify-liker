import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { SpotifyLikerJob } from "@/types/SpotifyLikerJob";
import { Job } from "bullmq";
import { AppError } from "@/types/AppError";

export class QueueService {
  private queue: Queue;
  private redisClient: Redis;
  public QUEUE_NAME = "like-songs-queue";

  constructor() {
    if (!process.env.REDIS_HOST) {
      throw new Error("REDIS_HOST environment variable is not set.");
    }

    this.redisClient = new Redis(process.env.REDIS_HOST!, {
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue(this.QUEUE_NAME, {
      connection: this.redisClient,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConnection(): any {
    return this.queue.opts.connection;
  }

  async closeConnection() {
    await this.redisClient.quit();
    await this.queue.close();
  }

  async listAllKeys() {
    const keys = await this.redisClient.keys("*");
    return keys;
  }

  async getQueueLength(): Promise<{
    waiting: number;
    active: number;
    delayed: number;
    totalCount: number;
  }> {
    const jobCounts = await this.queue.getJobCounts();
    const waiting = jobCounts.waiting || 0;
    const active = jobCounts.active || 0;
    const delayed = jobCounts.delayed || 0;
    const totalCount = waiting + active + delayed;
    return {
      waiting,
      active,
      delayed,
      totalCount,
    };
  }

  async enqueueJob(
    email: string,
    username: string,
    accessToken: string,
  ): Promise<Job<SpotifyLikerJob>> {
    if (!email || !accessToken) {
      throw new AppError({
        message: "Email and access token are required to enqueue a job.",
        statusCode: 400,
      });
    }

    const currentJobsForUser = await this.getPendingJobsByEmail(email);
    if (currentJobsForUser && currentJobsForUser.length > 0) {
      throw new AppError({
        message: `User ${email} already has a pending job. Wait a bit before trying again.`,
        statusCode: 400,
      })
    }

    const jobData = {
      email,
      username,
      accessToken,
    };

    const newJob = await this.queue.add(this.QUEUE_NAME, jobData);

    console.log(`Enqueued job for ${email} at: ${new Date(newJob.timestamp)}`);
    return newJob;
  }

  async getPendingJobsByEmail(email: string): Promise<Job[]> {
    const jobs = await this.queue.getJobs(["waiting", "active", "delayed"]);

    const userJobs = jobs.filter((job) => job.data.email === email);

    return userJobs;
  }
}
