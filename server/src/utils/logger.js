import { env } from "../config/env.js";

export function logInfo(message, metadata) {
  if (metadata) {
    console.log(message, metadata);
    return;
  }
  console.log(message);
}

export function logError(message, error) {
  if (env.isProduction) {
    console.error(message);
    return;
  }
  console.error(message, error);
}
