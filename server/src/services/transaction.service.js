import { Transaction } from "../models/transaction.model.js";

export async function getRecentTransactions(limit) {
  return Transaction.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function createTransaction(payload) {
  return Transaction.create(payload);
}

export async function updateTransactionById(id, payload) {
  return Transaction.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

export async function deleteTransactionById(id) {
  return Transaction.findByIdAndDelete(id);
}
