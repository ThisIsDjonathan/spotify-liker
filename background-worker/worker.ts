import { Worker } from "bullmq";
import { QueueService } from "@/lib/queueService";
import { SpotifyService } from "@/lib/spotifyService";
import { EmailService } from "@/lib/emailService";
import { buildEmailMessage, buildEmailSubject } from "@/lib/utils";
import { MongoDbService } from "@/lib/mongoDbService";

const queueService = new QueueService();
const emailService = new EmailService();
const mongoDbService = new MongoDbService();

console.log("Starting background worker...");

// Create a worker to process jobs from the queue
const worker = new Worker(
  queueService.QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ID: ${job.id} for user: ${job.data.email}`);

    const { email, accessToken, username } = job.data;

    job.updateProgress(1);

    try {
      const spotifyService = new SpotifyService(accessToken);
      const result = await spotifyService.likeAll(email, (progress) =>
        job.updateProgress(progress),
      );

      console.log(
        `Successfully processed ${result.playlistCount} playlists and ${result.songsCount} tracks for user: ${email}`,
      );

      const emailSubject = buildEmailSubject();
      const emailMessage = buildEmailMessage(
        username,
        result.playlistCount,
        result.songsCount,
      );

      job.updateProgress(98);

      await emailService.sendEmail(email, emailSubject, emailMessage);

      await mongoDbService.saveResults(
        email,
        username,
        result.playlistCount,
        result.songsCount,
      );

      job.updateProgress(100);
    } catch (error) {
      console.error(
        `Failed to process job ID: ${job.id} for user: ${email}`,
        error,
      );
    }
  },
  {
    connection: queueService.getConnection(),
  },
);

// Handle worker events
worker.on("completed", (job) => {
  console.log(`Job ID: ${job.id} has been completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ID: ${job?.id} has failed.`, err);
});

worker.on("error", (err) => {
  console.error("Worker encountered an error:", err);
});
