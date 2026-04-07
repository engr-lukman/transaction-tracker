import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectDatabase } from "./config/database.js";
import { initializeSocket } from "./socket/socket.js";
import { logError, logInfo } from "./utils/logger.js";

const app = createApp();
const httpServer = createServer(app);

initializeSocket(httpServer, env.clientOrigin);

async function gracefulShutdown(signal) {
  logInfo(`${signal} received. Shutting down gracefully...`);

  httpServer.close(async () => {
    try {
      await disconnectDatabase();
      logInfo("Database disconnected");
      process.exit(0);
    } catch (error) {
      logError("Error during shutdown:", error);
      process.exit(1);
    }
  });
}

export async function startServer() {
  try {
    await connectToDatabase();
    logInfo("MongoDB connected");

    httpServer.listen(env.port, () => {
      logInfo(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    logError("Failed to start server:", error);
    process.exit(1);
  }
}
