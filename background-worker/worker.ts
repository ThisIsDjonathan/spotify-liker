import { Worker } from "bullmq";
import { QueueService } from "@/lib/queueService";
import { SpotifyService } from "@/lib/spotifyService";
import { EmailService } from "@/lib/emailService";
import { buildEmailMessage, buildEmailSubject } from "@/lib/utils";

const queueService = new QueueService();
const emailService = new EmailService();

console.log("Starting background worker...");

// Create a worker to process jobs from the queue
const worker = new Worker(
  queueService.QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ID: ${job.id} for user: ${job.data.email}`);

    const { email, accessToken, lockUserKey, username } = job.data;

    try {
      const spotifyService = new SpotifyService(accessToken);
      const result = await spotifyService.likeAll(email);

      console.log(
        `Successfully processed ${result.playlistCount} playlists and ${result.songsCount} tracks for user: ${email}`,
      );

      const emailSubject = buildEmailSubject();
      const emailMessage = buildEmailMessage(
        username,
        result.playlistCount,
        result.songsCount,
      );
      await emailService.sendEmail(email, emailSubject, emailMessage);
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
