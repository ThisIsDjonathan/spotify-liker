import { MongoClient, Db, Collection } from "mongodb";

export class MongoDbService {
  private client: MongoClient;
  private db: Db;
  private collection: Collection;

  constructor() {
    if (
      !process.env.MONGO_URI ||
      !process.env.MONGO_DB_NAME ||
      !process.env.MONGO_COLLECTION_NAME
    ) {
      throw new Error(
        "MongoDB configuration is missing. Please set MONGO_URI, MONGO_DB_NAME, and MONGO_COLLECTION_NAME in your environment variables.",
      );
    }

    this.client = new MongoClient(process.env.MONGO_URI);
    this.db = this.client.db(process.env.MONGO_DB_NAME);
    this.collection = this.db.collection(process.env.MONGO_COLLECTION_NAME);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }

  async saveResults(
    email: string,
    username: string,
    playlistCount: number,
    songsCount: number,
  ): Promise<void> {
    try {
      const result = await this.collection.insertOne({
        email,
        username,
        playlistCount,
        songsCount,
        createdAt: new Date(),
      });

      console.log(`Results saved to MongoDB with ID: ${result.insertedId}`);
    } catch (error) {
      console.error("Failed to save results to MongoDB:", error);
      throw new Error("Failed to save results to MongoDB");
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
    }
  }
}
