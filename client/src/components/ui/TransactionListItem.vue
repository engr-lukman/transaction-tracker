<!--
TransactionListItem.vue
Individual transaction item with edit/delete actions
-->
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { formatAmount, timeAgo } from "../../utils/formatting.js";

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
  isConfirmingDelete: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete", "toggleConfirm"]);
</script>

<template>
  <li class="rounded-lg border border-border bg-surface-alt px-4 py-3">
    <div
      class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0 flex-1">
        <p class="break-words text-sm font-medium text-text">
          {{ transaction.title }}
        </p>
        <p class="text-xs text-text-muted">
          {{ timeAgo(transaction.createdAt) }}
        </p>
      </div>
      <span class="text-sm font-semibold text-primary sm:ml-4 sm:shrink-0">
        {{ formatAmount(transaction.amount) }}
      </span>
    </div>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        @click="emit('edit', transaction)"
        class="cursor-pointer rounded-md bg-warning/10 px-3 py-1 text-xs font-medium text-warning transition hover:bg-warning/20"
      >
        Edit
      </button>
      <button
        v-if="!isConfirmingDelete"
        type="button"
        @click="emit('toggleConfirm', transaction._id)"
        class="cursor-pointer rounded-md bg-danger/10 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/20"
      >
        Delete
      </button>
      <template v-else>
        <button
          type="button"
          @click="emit('delete', transaction._id)"
          class="cursor-pointer rounded-md bg-danger px-3 py-1 text-xs font-medium text-white transition hover:bg-danger/90"
        >
          Confirm
        </button>
        <button
          type="button"
          @click="emit('toggleConfirm', transaction._id)"
          class="cursor-pointer rounded-md bg-border px-3 py-1 text-xs font-medium text-text-muted transition hover:bg-border/70"
        >
          Cancel
        </button>
      </template>
    </div>
  </li>
</template>
