/**
 * useTransactionForm Composable
 * Manages form state, validation, and submission logic
 */

import { ref, computed } from "vue";
import { VALIDATION, MESSAGES } from "../config/constants.js";
import {
  createTransaction,
  updateTransaction,
} from "../services/transactionApi.js";

export function useTransactionForm() {
  const title = ref("");
  const amount = ref("");
  const submitting = ref(false);
  const error = ref("");
  const editingId = ref(null);

  const isEditing = computed(() => editingId.value !== null);

  /**
   * Validate form inputs
   * @returns {Object|null} Error object or null if valid
   */
  function validateForm() {
    const trimmedTitle = title.value.trim();

    if (!trimmedTitle) {
      return { error: MESSAGES.ERROR.TITLE_REQUIRED };
    }

    if (trimmedTitle.length > VALIDATION.MAX_TITLE_LENGTH) {
      return { error: MESSAGES.ERROR.TITLE_TOO_LONG };
    }

    const numAmount = Number(amount.value);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return { error: MESSAGES.ERROR.AMOUNT_INVALID };
    }

    return null;
  }

  /**
   * Handle form submission (create or update)
   * @returns {Promise<Object|null>} Created/updated transaction or null on error
   */
  async function handleSubmit() {
    error.value = "";

    const validation = validateForm();
    if (validation) {
      error.value = validation.error;
      return null;
    }

    submitting.value = true;
    try {
      const payload = {
        title: title.value.trim(),
        amount: Number(amount.value),
      };

      let result;
      if (isEditing.value) {
        result = await updateTransaction(editingId.value, payload);
      } else {
        result = await createTransaction(payload);
      }

      cancelEdit();
      return result;
    } catch (err) {
      error.value = err.message || MESSAGES.ERROR.NETWORK_ERROR;
      console.error("handleSubmit error:", err);
      return null;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * Start editing a transaction
   * @param {Object} transaction - Transaction to edit
   */
  function startEdit(transaction) {
    editingId.value = transaction._id;
    title.value = transaction.title;
    amount.value = String(transaction.amount);
    error.value = "";
  }

  /**
   * Cancel editing and reset form
   */
  function cancelEdit() {
    editingId.value = null;
    title.value = "";
    amount.value = "";
    error.value = "";
  }

  return {
    // State
    title,
    amount,
    submitting,
    error,
    editingId,
    isEditing,
    // Methods
    handleSubmit,
    startEdit,
    cancelEdit,
    validateForm,
  };
}
