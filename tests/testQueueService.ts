import { QueueService } from "@/lib/queueService";

async function test() {
  const queueService = new QueueService();
  const connection = queueService.getConnection();
  console.log("Redis connection established:", connection.options.host);
  await queueService.closeConnection();
}

test();
