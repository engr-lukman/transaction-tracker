/**
 * Application Constants
 * Shared constants used across the application
 */

export const VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MIN_AMOUNT: 0.01,
};

export const UI = {
  MAX_DISPLAY: 5,
  ANIMATION_DURATION: 300,
};

export const MESSAGES = {
  ERROR: {
    TITLE_REQUIRED: "Title is required.",
    TITLE_TOO_LONG: `Title must be ${VALIDATION.MAX_TITLE_LENGTH} characters or fewer.`,
    AMOUNT_INVALID: "Amount must be a positive number.",
    FETCH_FAILED: "Failed to fetch transactions.",
    SAVE_FAILED: "Failed to save transaction.",
    DELETE_FAILED: "Failed to delete transaction.",
    NETWORK_ERROR: "Network error. Please try again.",
  },
  EMPTY_STATE: {
    TITLE: "No transactions yet",
    DESCRIPTION: "Add your first transaction from the form.",
  },
};

export const SOCKET_EVENTS = {
  TRANSACTION_ADDED: "transaction-added",
  TRANSACTION_UPDATED: "transaction-updated",
  TRANSACTION_DELETED: "transaction-deleted",
};
