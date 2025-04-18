import { Redis } from "ioredis";

async function testRedisConnection() {
  console.log(`Testing Redis connection on host: ${process.env.NODE_ENV}`);
  console.log(`Using host: ${process.env.REDIS_HOST}`);

  const redis = new Redis(process.env.REDIS_HOST!);

  try {
    await redis.ping();
    console.log("Successfully connected to Redis!");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  } finally {
    redis.disconnect();
  }
}

testRedisConnection();
