import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { transactionRouter } from "./routes/transaction.routes.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error-handler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: "16kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.nodeEnv });
  });

  app.use("/api", transactionRouter);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
