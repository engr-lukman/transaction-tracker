<!--
TransactionList.vue
Transaction list with animation and empty state
-->
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import TransactionListItem from "./TransactionListItem.vue";
import { MESSAGES } from "../../config/constants.js";

defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  confirmDeleteId: {
    type: String,
    default: null,
  },
});

defineEmits(["edit", "delete", "toggleConfirm"]);
</script>

<template>
  <section class="lg:col-span-2">
    <div
      class="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <h2 class="mb-4 text-lg font-semibold text-text">Live Transactions</h2>

      <div
        v-if="transactions.length === 0"
        class="rounded-lg border border-dashed border-border bg-surface-alt py-10 text-center"
      >
        <p class="text-sm font-medium text-text">
          {{ MESSAGES.EMPTY_STATE.TITLE }}
        </p>
        <p class="mt-1 text-xs text-text-muted">
          {{ MESSAGES.EMPTY_STATE.DESCRIPTION }}
        </p>
      </div>

      <TransitionGroup v-else name="list" tag="ul" class="space-y-3">
        <TransactionListItem
          v-for="tx in transactions"
          :key="tx._id"
          :transaction="tx"
          :isConfirmingDelete="confirmDeleteId === tx._id"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @toggleConfirm="$emit('toggleConfirm', $event)"
        />
      </TransitionGroup>
    </div>
  </section>
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
