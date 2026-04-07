<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { socket, isConnected } from "./socket.js";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const MAX_DISPLAY = 5;

const title = ref("");
const amount = ref("");
const transactions = ref([]);
const submitting = ref(false);
const error = ref("");
const editingId = ref(null);
const confirmDeleteId = ref(null);
const isEditing = computed(() => editingId.value !== null);

async function fetchTransactions() {
  try {
    const res = await fetch(`${API_URL}/api/transactions`);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    transactions.value = await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function handleSubmit() {
  error.value = "";

  const trimmedTitle = title.value.trim();
  if (!trimmedTitle) {
    error.value = "Title is required.";
    return;
  }
  if (trimmedTitle.length > 100) {
    error.value = "Title must be 100 characters or fewer.";
    return;
  }

  const numAmount = Number(amount.value);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    error.value = "Amount must be a positive number.";
    return;
  }

  submitting.value = true;
  try {
    const url = isEditing.value
      ? `${API_URL}/api/transactions/${editingId.value}`
      : `${API_URL}/api/transactions`;

    const res = await fetch(url, {
      method: isEditing.value ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedTitle, amount: numAmount }),
    });

    if (!res.ok) {
      const data = await res.json();
      error.value = data.error || "Failed to save transaction.";
      return;
    }

    cancelEdit();
  } catch (err) {
    error.value = "Network error. Please try again.";
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

function startEdit(tx) {
  editingId.value = tx._id;
  title.value = tx.title;
  amount.value = String(tx.amount);
  confirmDeleteId.value = null;
}

function cancelEdit() {
  editingId.value = null;
  title.value = "";
  amount.value = "";
  error.value = "";
}

async function deleteTransaction(id) {
  try {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      error.value = data.error || "Failed to delete transaction.";
    }
  } catch (err) {
    error.value = "Network error. Please try again.";
    console.error(err);
  } finally {
    confirmDeleteId.value = null;
  }
}

function toggleDeleteConfirm(id) {
  confirmDeleteId.value = confirmDeleteId.value === id ? null : id;
}

// --- Socket event handlers ---
function onTransactionAdded(transaction) {
  transactions.value.unshift(transaction);
  if (transactions.value.length > MAX_DISPLAY) {
    transactions.value.pop();
  }
}

function onTransactionUpdated(updated) {
  const idx = transactions.value.findIndex((tx) => tx._id === updated._id);
  if (idx !== -1) {
    transactions.value[idx] = updated;
  }
}

function onTransactionDeleted({ _id }) {
  transactions.value = transactions.value.filter((tx) => tx._id !== _id);
  if (editingId.value === _id) {
    cancelEdit();
  }
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

onMounted(() => {
  fetchTransactions();
  socket.off("transaction-added", onTransactionAdded);
  socket.off("transaction-updated", onTransactionUpdated);
  socket.off("transaction-deleted", onTransactionDeleted);
  socket.on("transaction-added", onTransactionAdded);
  socket.on("transaction-updated", onTransactionUpdated);
  socket.on("transaction-deleted", onTransactionDeleted);
});

onUnmounted(() => {
  socket.off("transaction-added", onTransactionAdded);
  socket.off("transaction-updated", onTransactionUpdated);
  socket.off("transaction-deleted", onTransactionDeleted);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-text">Transaction Tracker</h1>
        <div class="flex items-center gap-2 text-sm text-text-muted">
          <span
            class="inline-block h-2.5 w-2.5 rounded-full"
            :class="isConnected ? 'bg-success animate-pulse' : 'bg-danger'"
          ></span>
          {{ isConnected ? "Live" : "Disconnected" }}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside class="lg:sticky lg:top-8 lg:col-span-1 lg:self-start">
          <div
            class="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
          >
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-text">
                {{ isEditing ? "Update Transaction" : "New Transaction" }}
              </h2>
              <button
                v-if="isEditing"
                type="button"
                @click="cancelEdit"
                class="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-muted transition hover:text-text"
              >
                Cancel Edit
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label
                  for="title"
                  class="mb-1 block text-sm font-medium text-text"
                >
                  Title
                </label>
                <input
                  id="title"
                  v-model="title"
                  type="text"
                  maxlength="100"
                  placeholder="e.g. Coffee, Rent, Salary"
                  class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label
                  for="amount"
                  class="mb-1 block text-sm font-medium text-text"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  v-model="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p v-if="error" class="text-sm text-danger">{{ error }}</p>
              <button
                type="submit"
                :disabled="submitting"
                class="w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                :class="
                  isEditing
                    ? 'bg-warning hover:bg-warning/90'
                    : 'bg-primary hover:bg-primary-hover'
                "
              >
                {{
                  submitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Transaction"
                      : "Add Transaction"
                }}
              </button>
            </form>
          </div>
        </aside>

        <section class="lg:col-span-2">
          <div
            class="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
          >
            <h2 class="mb-4 text-lg font-semibold text-text">
              Live Transactions
            </h2>

            <div
              v-if="transactions.length === 0"
              class="rounded-lg border border-dashed border-border bg-surface-alt py-10 text-center"
            >
              <p class="text-sm font-medium text-text">No transactions yet</p>
              <p class="mt-1 text-xs text-text-muted">
                Add your first transaction from the form.
              </p>
            </div>

            <TransitionGroup name="list" tag="ul" class="space-y-3">
              <li
                v-for="tx in transactions"
                :key="tx._id"
                class="rounded-lg border border-border bg-surface-alt px-4 py-3"
              >
                <div
                  class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0 flex-1">
                    <p class="break-words text-sm font-medium text-text">
                      {{ tx.title }}
                    </p>
                    <p class="text-xs text-text-muted">
                      {{ timeAgo(tx.createdAt) }}
                    </p>
                  </div>
                  <span
                    class="text-sm font-semibold text-primary sm:ml-4 sm:shrink-0"
                  >
                    {{ formatAmount(tx.amount) }}
                  </span>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    @click="startEdit(tx)"
                    class="cursor-pointer rounded-md bg-warning/10 px-3 py-1 text-xs font-medium text-warning transition hover:bg-warning/20"
                  >
                    Edit
                  </button>
                  <button
                    v-if="confirmDeleteId !== tx._id"
                    type="button"
                    @click="toggleDeleteConfirm(tx._id)"
                    class="cursor-pointer rounded-md bg-danger/10 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/20"
                  >
                    Delete
                  </button>
                  <template v-else>
                    <button
                      type="button"
                      @click="deleteTransaction(tx._id)"
                      class="cursor-pointer rounded-md bg-danger px-3 py-1 text-xs font-medium text-white transition hover:bg-danger/90"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      @click="toggleDeleteConfirm(tx._id)"
                      class="cursor-pointer rounded-md bg-border px-3 py-1 text-xs font-medium text-text-muted transition hover:bg-border/70"
                    >
                      Cancel
                    </button>
                  </template>
                </div>
              </li>
            </TransitionGroup>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-move {
  transition: all 0.3s ease-out;
}
.list-leave-active {
  transition: all 0.2s ease-in;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
