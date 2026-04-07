import { env } from "../config/env.js";
import { logError } from "../utils/logger.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found." });
}

export function globalErrorHandler(error, _req, res, _next) {
  logError("Unhandled server error", error);

  if (!env.isProduction) {
    return res.status(500).json({
      error: "Internal server error.",
      details: error?.message,
    });
  }

  return res.status(500).json({ error: "Internal server error." });
}
