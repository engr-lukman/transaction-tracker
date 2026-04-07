/**
 * useTransactionList Composable
 * Manages transaction list state and operations
 */

import { ref } from "vue";
import { UI } from "../config/constants.js";

export function useTransactionList() {
  const transactions = ref([]);

  /**
   * Set transactions list (typically from API fetch)
   * @param {Array} data - List of transactions
   */
  function setTransactions(data) {
    transactions.value = data;
  }

  /**
   * Add transaction to beginning of list, enforcing max display limit
   * @param {Object} transaction - Transaction to add
   */
  function addTransaction(transaction) {
    transactions.value.unshift(transaction);
    if (transactions.value.length > UI.MAX_DISPLAY) {
      transactions.value.pop();
    }
  }

  /**
   * Update a transaction in the list by ID
   * @param {Object} updatedTransaction - Transaction with updated data
   * @returns {boolean} True if found and updated, false otherwise
   */
  function updateTransaction(updatedTransaction) {
    const index = transactions.value.findIndex(
      (tx) => tx._id === updatedTransaction._id,
    );
    if (index !== -1) {
      transactions.value[index] = updatedTransaction;
      return true;
    }
    return false;
  }

  /**
   * Remove transaction from list by ID
   * @param {string} id - Transaction ID to remove
   * @returns {boolean} True if found and removed, false otherwise
   */
  function removeTransaction(id) {
    const index = transactions.value.findIndex((tx) => tx._id === id);
    if (index !== -1) {
      transactions.value.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if list is empty
   * @returns {boolean} True if no transactions
   */
  function isEmpty() {
    return transactions.value.length === 0;
  }

  return {
    // State
    transactions,
    // Methods
    setTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    isEmpty,
  };
}
