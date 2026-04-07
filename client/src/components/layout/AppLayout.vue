<!--
AppLayout.vue
Main application layout with responsive grid
-->
<script setup lang="ts">
import { defineProps } from "vue";
import StatusIndicator from "../ui/StatusIndicator.vue";

defineProps({
  isConnected: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-text">Transaction Tracker</h1>
        <StatusIndicator :is-connected="isConnected" />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <slot />
      </div>
    </div>
  </div>
</template>
