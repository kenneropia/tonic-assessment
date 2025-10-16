import mongoose from "mongoose";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI!;
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME || ""}:${
    process.env.REDIS_PASSWORD || ""
  }@${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};

redisClient.on("error", (err) => console.error("Redis client error:", err));
