<!--
StatusIndicator.vue
Displays connection status indicator (Live/Disconnected)
-->
<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  isConnected: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-text-muted">
    <span
      class="inline-block h-2.5 w-2.5 rounded-full"
      :class="isConnected ? 'bg-success animate-pulse' : 'bg-danger'"
    ></span>
    {{ isConnected ? "Live" : "Disconnected" }}
  </div>
</template>
