import mongoose from "mongoose";
import { sanitizeTitle, toPositiveNumber } from "../utils/sanitize.js";

export function validateTransactionPayload(payload) {
  const sanitizedTitle = sanitizeTitle(payload?.title);

  if (!sanitizedTitle) {
    return { error: "Title is required and must be a non-empty string." };
  }

  if (sanitizedTitle.length > 100) {
    return { error: "Title must be 100 characters or fewer." };
  }

  const normalizedAmount = toPositiveNumber(payload?.amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  return {
    data: {
      title: sanitizedTitle,
      amount: normalizedAmount,
    },
  };
}

export function validateObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Invalid transaction ID." };
  }

  return { data: id };
}
