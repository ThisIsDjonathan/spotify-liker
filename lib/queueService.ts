import { Queue } from "bullmq";
import { Redis } from "ioredis";

export class QueueService {
  private queue: Queue;
  private redisClient: Redis;
  public QUEUE_NAME = "like-songs-queue";
  //public USER_LOCKED_FOR_SECONDS = 24 * 60 * 60; // 24 hours
  public USER_LOCKED_FOR_SECONDS = 60

  constructor() {
    if (!process.env.REDIS_HOST) {
      throw new Error("REDIS_HOST environment variable is not set.");
    }

    if (process.env.NODE_ENV == "production") {
      this.redisClient = new Redis(process.env.REDIS_HOST!, {
        tls: {}, // Enable TLS on production
      });
    } else {
      this.redisClient = new Redis(process.env.REDIS_HOST!);
    }

    this.queue = new Queue("like-songs-queue", {
      connection: {
        host: process.env.REDIS_HOST,
      },
    });
  }

  getConnection() {
    return this.queue.opts.connection;
  }

  async listAllKeys() {
    const keys = await this.redisClient.keys("*");
    return keys;
  }

  async enqueueJob(email: string, accessToken: string): Promise<any> {
    if (!email || !accessToken) {
      throw new Error("Email and access token are required to enqueue a job.");
    }

    const userLocked = await this.isUserLocked(email);
    if (userLocked) {
      console.log(`User ${email} is already locked. Skipping job enqueue.`);
      return;
    } else {
      await this.lockUser(email);
    }

    const jobData = {
      email,
      accessToken,
      lockUserKey: this.buildLockRedisKey(email),
    };

    const newJob = await this.queue.add(this.QUEUE_NAME, jobData);

    console.log(`Enqueued job for ${email} at: ${new Date(newJob.timestamp)}`);
    return newJob;
  }

  async lockUser(email: string): Promise<any> {
    const redisKey = this.buildLockRedisKey(email);
    const record = await this.redisClient.set(redisKey, "locked", "EX", this.USER_LOCKED_FOR_SECONDS);
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
