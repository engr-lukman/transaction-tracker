import { env } from "../config/env.js";
import {
  createTransaction,
  deleteTransactionById,
  getRecentTransactions,
  updateTransactionById,
} from "../services/transaction.service.js";
import {
  validateObjectId,
  validateTransactionPayload,
} from "../validations/transaction.validation.js";
import { emitSocketEvent } from "../socket/socket.js";

export async function getTransactionsController(_req, res, next) {
  try {
    const transactions = await getRecentTransactions(env.listLimit);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function createTransactionController(req, res, next) {
  try {
    const validation = validateTransactionPayload(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const transaction = await createTransaction(validation.data);

    emitSocketEvent("transaction-added", transaction.toObject());
    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
}

export async function updateTransactionController(req, res, next) {
  try {
    const idValidation = validateObjectId(req.params.id);
    if (idValidation.error) {
      return res.status(400).json({ error: idValidation.error });
    }

    const payloadValidation = validateTransactionPayload(req.body);
    if (payloadValidation.error) {
      return res.status(400).json({ error: payloadValidation.error });
    }

    const transaction = await updateTransactionById(
      idValidation.data,
      payloadValidation.data,
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    emitSocketEvent("transaction-updated", transaction.toObject());
    return res.json(transaction);
  } catch (error) {
    return next(error);
  }
}

export async function deleteTransactionController(req, res, next) {
  try {
    const idValidation = validateObjectId(req.params.id);
    if (idValidation.error) {
      return res.status(400).json({ error: idValidation.error });
    }

    const transaction = await deleteTransactionById(idValidation.data);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    emitSocketEvent("transaction-deleted", { _id: idValidation.data });
    return res.json({ message: "Transaction deleted." });
  } catch (error) {
    return next(error);
  }
}
