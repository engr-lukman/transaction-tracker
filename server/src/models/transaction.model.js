import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
