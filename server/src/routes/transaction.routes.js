import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionsController,
  updateTransactionController,
} from "../controllers/transaction.controller.js";

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const transactionRouter = Router();

transactionRouter.get("/transactions", getTransactionsController);
transactionRouter.post(
  "/transactions",
  writeLimiter,
  createTransactionController,
);
transactionRouter.put(
  "/transactions/:id",
  writeLimiter,
  updateTransactionController,
);
transactionRouter.delete(
  "/transactions/:id",
  writeLimiter,
  deleteTransactionController,
);
