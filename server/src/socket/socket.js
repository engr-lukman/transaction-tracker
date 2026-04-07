import { Server } from "socket.io";
import { logInfo, logError } from "../utils/logger.js";

let ioInstance = null;

export function initializeSocket(httpServer, clientOrigin) {
  ioInstance = new Server(httpServer, {
    cors: { origin: clientOrigin },
  });

  ioInstance.on("connection", (socket) => {
    logInfo(`Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      logInfo(`Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function emitSocketEvent(eventName, payload) {
  if (!ioInstance) {
    logError(`Socket not initialized. Skipping emit for ${eventName}.`);
    return;
  }

  try {
    ioInstance.emit(eventName, payload);
  } catch (error) {
    logError(`Socket emit failed for ${eventName}:`, error);
  }
}
