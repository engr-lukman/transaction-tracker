<!--
TransactionForm.vue
Form for adding and updating transactions
-->
<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { VALIDATION, MESSAGES } from "../../config/constants.js";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
  submitting: {
    type: Boolean,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "submit",
  "cancelEdit",
  "update:title",
  "update:amount",
]);
</script>

<template>
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
          @click="emit('cancelEdit')"
          class="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-muted transition hover:text-text"
        >
          Cancel Edit
        </button>
      </div>
      <form @submit.prevent="emit('submit')" class="space-y-4">
        <div>
          <label for="title" class="mb-1 block text-sm font-medium text-text">
            Title
          </label>
          <input
            id="title"
            :value="title"
            @input="emit('update:title', $event.target.value)"
            type="text"
            :maxlength="VALIDATION.MAX_TITLE_LENGTH"
            placeholder="e.g. Coffee, Rent, Salary"
            class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label for="amount" class="mb-1 block text-sm font-medium text-text">
            Amount
          </label>
          <input
            id="amount"
            :value="amount"
            @input="emit('update:amount', $event.target.value)"
            type="number"
            step="0.01"
            :min="VALIDATION.MIN_AMOUNT"
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
</template>
