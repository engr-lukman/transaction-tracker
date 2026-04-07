/**
 * Transaction API Service
 * Handles all HTTP requests related to transactions
 */

import { API_BASE_URL, API_ENDPOINTS, API_CONFIG } from "../config/api.js";
import { MESSAGES } from "../config/constants.js";

/**
 * Fetch all transactions
 * @returns {Promise<Array>} Array of transactions
 * @throws {Error} When fetch fails
 */
export async function fetchTransactions() {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`);
    if (!res.ok) throw new Error(MESSAGES.ERROR.FETCH_FAILED);
    return await res.json();
  } catch (error) {
    console.error("fetchTransactions error:", error);
    throw error;
  }
}

/**
 * Create a new transaction
 * @param {Object} data - Transaction data {title, amount}
 * @returns {Promise<Object>} Created transaction with _id
 * @throws {Error} When request fails or validation error occurs
 */
export async function createTransaction(data) {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`, {
      method: "POST",
      ...API_CONFIG,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || MESSAGES.ERROR.SAVE_FAILED);
    }

    return await res.json();
  } catch (error) {
    console.error("createTransaction error:", error);
    throw error;
  }
}

/**
 * Update an existing transaction
 * @param {string} id - Transaction ID
 * @param {Object} data - Updated transaction data {title, amount}
 * @returns {Promise<Object>} Updated transaction
 * @throws {Error} When request fails or validation error occurs
 */
export async function updateTransaction(id, data) {
  try {
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION_BY_ID(id)}`,
      {
        method: "PUT",
        ...API_CONFIG,
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || MESSAGES.ERROR.SAVE_FAILED);
    }

    return await res.json();
  } catch (error) {
    console.error("updateTransaction error:", error);
    throw error;
  }
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<void>}
 * @throws {Error} When request fails
 */
export async function deleteTransaction(id) {
  try {
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION_BY_ID(id)}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || MESSAGES.ERROR.DELETE_FAILED);
    }
  } catch (error) {
    console.error("deleteTransaction error:", error);
    throw error;
  }
}
