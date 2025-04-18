import { MongoDbService } from "@/lib/mongoDbService";

const mongoDbService = new MongoDbService();

async function main() {
  try {
    await mongoDbService.saveResults(
      "user@example.com",
      "exampleUser",
      10, // Playlist count
      100, // Songs count
    );

    console.log("Results saved successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoDbService.disconnect();
  }
}

main();
