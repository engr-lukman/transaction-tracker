import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const {
  PORT = 3001,
  MONGO_URI,
  CLIENT_ORIGIN = "http://localhost:5173",
  NODE_ENV = "development",
} = process.env;

const LIST_LIMIT = 5;
const isProduction = NODE_ENV === "production";

// --- Mongoose schema ---
const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

let mongoConnectionPromise = null;

async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(MONGO_URI).catch((error) => {
      mongoConnectionPromise = null;
      throw error;
    });
  }
  return mongoConnectionPromise;
}

function emitEvent(eventName, payload) {
  try {
    io.emit(eventName, payload);
  } catch (emitError) {
    console.error(`Socket emit failed for ${eventName}:`, emitError);
  }
}

// --- Validation helper ---
function validateTransaction(title, amount) {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return "Title is required and must be a non-empty string.";
  }
  if (title.trim().length > 100) {
    return "Title must be 100 characters or fewer.";
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return "Amount must be a positive number.";
  }
  return null;
}

// --- Express app ---
const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "16kb" }));

// Rate limit write endpoints — 30 requests per minute per IP
const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// --- Routes ---

// GET — Fetch the 5 most recent transactions
app.get("/api/transactions", async (_req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT)
      .lean();
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// POST — Create a new transaction
app.post("/api/transactions", writeLimiter, async (req, res, next) => {
  try {
    const { title, amount } = req.body;

    const validationError = validateTransaction(title, amount);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      amount: Number(amount),
    });

    emitEvent("transaction-added", transaction.toObject());
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

// PUT — Update an existing transaction
app.put("/api/transactions/:id", writeLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }

    const { title, amount } = req.body;

    const validationError = validateTransaction(title, amount);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { title: title.trim(), amount: Number(amount) },
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    emitEvent("transaction-updated", transaction.toObject());
    res.json(transaction);
  } catch (err) {
    next(err);
  }
});

// DELETE — Remove a transaction
app.delete("/api/transactions/:id", writeLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    emitEvent("transaction-deleted", { _id: id });
    res.json({ message: "Transaction deleted." });
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  if (!isProduction) {
    console.error(err);
  }
  res.status(500).json({ error: "Internal server error." });
});

// --- HTTP + Socket.io ---
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Start ---
async function start() {
  try {
    await connectToDatabase();
    console.log("MongoDB connected");

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${NODE_ENV})`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
