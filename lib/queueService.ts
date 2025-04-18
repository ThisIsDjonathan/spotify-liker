import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { SpotifyLikerJob } from "@/types/SpotifyLikerJob";
import { Job } from "bullmq";

export class QueueService {
  private queue: Queue;
  private redisClient: Redis;
  public QUEUE_NAME = "like-songs-queue";
  public USER_LOCKED_FOR_SECONDS = parseInt(
    process.env.USER_LOCK_TTL || "60",
    10,
  );

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
  ): Promise<Job<SpotifyLikerJob> | null> {
    if (!email || !accessToken) {
      throw new Error("Email and access token are required to enqueue a job.");
    }

    const userLocked = await this.isUserLocked(email);
    if (userLocked) {
      console.log(`User ${email} is already locked. Skipping job enqueue.`);
      return null;
    } else {
      await this.lockUser(email);
    }

    const jobData = {
      email,
      username,
      accessToken,
      lockUserKey: this.buildLockRedisKey(email),
    };

    const newJob = await this.queue.add(this.QUEUE_NAME, jobData);

    console.log(`Enqueued job for ${email} at: ${new Date(newJob.timestamp)}`);
    return newJob;
  }

  async lockUser(email: string): Promise<string | null> {
    const redisKey = this.buildLockRedisKey(email);
    const record = await this.redisClient.set(
      redisKey,
      "locked",
      "EX",
      this.USER_LOCKED_FOR_SECONDS,
    );
    return record;
  }

  async isUserLocked(email: string): Promise<boolean> {
    const redisKey = this.buildLockRedisKey(email);
    const userLocked = await this.redisClient.get(redisKey);
    return !!userLocked;
  }

  buildLockRedisKey(email: string): string {
    return `user:${email}:locked`;
  }
}
