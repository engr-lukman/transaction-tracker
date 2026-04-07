import mongoose from "mongoose";
import { env } from "./env.js";

let mongoConnectionPromise = null;

export async function connectToDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(env.mongoUri).catch((error) => {
      mongoConnectionPromise = null;
      throw error;
    });
  }

  return mongoConnectionPromise;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
