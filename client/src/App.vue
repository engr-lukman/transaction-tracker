<script setup>
import { ref, onMounted } from "vue";
import AppLayout from "./components/layout/AppLayout.vue";
import TransactionForm from "./components/ui/TransactionForm.vue";
import TransactionList from "./components/ui/TransactionList.vue";
import { useTransactionForm } from "./composables/useTransactionForm.js";
import { useTransactionList } from "./composables/useTransactionList.js";
import { useTransactionSocket } from "./composables/useTransactionSocket.js";
import { fetchTransactions, deleteTransaction } from "./services/transactionApi.js";
import { MESSAGES } from "./config/constants.js";

// Form logic composable
const {
  title,
  amount,
  submitting,
  error,
  editingId,
  isEditing,
  handleSubmit,
  startEdit,
  cancelEdit,
} = useTransactionForm();

// List management composable
const { transactions, setTransactions, addTransaction, updateTransaction, removeTransaction } =
  useTransactionList();

// Socket event handling
const { isConnected } = useTransactionSocket({
  onAdded: addTransaction,
  onUpdated: updateTransaction,
  onDeleted: (data) => {
    removeTransaction(data._id);
    if (editingId.value === data._id) {
      cancelEdit();
    }
  },
});

// Delete confirmation state
const confirmDeleteId = ref(null);

/**
 * Load transactions on mount
 */
async function loadTransactions() {
  try {
    const data = await fetchTransactions();
    setTransactions(data);
  } catch (err) {
    console.error("Failed to load transactions:", err);
  }
}

/**
 * Handle form submission
 */
async function onFormSubmit() {
  await handleSubmit();
  // Socket will handle the broadcast updates
}

/**
 * Handle transaction edit
 */
function onEditTransaction(transaction) {
  startEdit(transaction);
}

/**
 * Handle transaction delete
 */
async function onDeleteTransaction(id) {
  try {
    await deleteTransaction(id);
    confirmDeleteId.value = null;
    // Socket will handle the deletion update
  } catch (err) {
    error.value = err.message || MESSAGES.ERROR.NETWORK_ERROR;
  }
}

/**
 * Toggle delete confirmation
 */
function toggleDeleteConfirm(id) {
  confirmDeleteId.value = confirmDeleteId.value === id ? null : id;
}

// Load transactions on mount
onMounted(() => {
  loadTransactions();
});
</script>

<template>
  <AppLayout :is-connected="isConnected">
    <TransactionForm
      :title="title"
      :amount="amount"
      :error="error"
      :submitting="submitting"
      :is-editing="isEditing"
      @submit="onFormSubmit"
      @cancelEdit="cancelEdit"
      @update:title="(val) => (title = val)"
      @update:amount="(val) => (amount = val)"
    />
    <TransactionList
      :transactions="transactions"
      :confirm-delete-id="confirmDeleteId"
      @edit="onEditTransaction"
      @delete="onDeleteTransaction"
      @toggleConfirm="toggleDeleteConfirm"
    />
  </AppLayout>
</template>
