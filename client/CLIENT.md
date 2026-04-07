# Client Documentation

## Overview

Vue 3 (Composition API) frontend built with Vite and Tailwind CSS 4. It uses a mobile-first dashboard layout and listens to Socket.io events for real-time CRUD sync.

## Tailwind CSS 4 Setup

Tailwind 4 uses a **CSS-first configuration** — no `tailwind.config.js` is needed.

### Entry point: `src/style.css`

```css
@import "tailwindcss";

@theme {
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-surface: #ffffff;
  --color-surface-alt: #f9fafb;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
}
```

Custom colors are defined inside `@theme {}` and used as standard Tailwind utilities (e.g., `bg-primary`, `text-danger`, `bg-warning/10`).

### Vite plugin: `vite.config.js`

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
});
```

## Responsive Layout

- Container: `min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8`.
- Grid: `grid grid-cols-1 gap-6 lg:grid-cols-3`.
- Left panel: form card in `lg:col-span-1`, sticky with `lg:sticky lg:top-8`.
- Right panel: live transactions list in `lg:col-span-2`.
- Transaction item layout is mobile-first (`flex-col`) and switches at `sm` to `sm:flex-row`.

## Vue 3 Composition API Structure

The UI logic is in [client/src/App.vue](src/App.vue) using `<script setup>`.

### Reactive State

| Ref | Type | Purpose |
|-----|------|---------|
| `title` | `string` | Form input for transaction title |
| `amount` | `string` | Form input for transaction amount |
| `transactions` | `array` | List of displayed transactions (max 5) |
| `submitting` | `boolean` | Loading state during form submission |
| `error` | `string` | Validation/network error message |
| `editingId` | `string \| null` | ID of the transaction being edited, or `null` |
| `confirmDeleteId` | `string \| null` | ID of the transaction pending delete confirmation |
| `isEditing` | `boolean` | Computed state for edit mode |

### Functions

| Function | Description |
|----------|-------------|
| `fetchTransactions()` | GET request on mount to load the 5 most recent transactions |
| `handleSubmit()` | POST (create) or PUT (update) based on edit mode |
| `startEdit(tx)` | Populate form with existing transaction data |
| `cancelEdit()` | Reset form and clear `editingId` |
| `deleteTransaction(id)` | Send DELETE request and clear confirmation state |
| `toggleDeleteConfirm(id)` | Toggle the delete confirmation toggle per item |

## Socket.io Listener Logic

### Connection: [client/src/socket.js](src/socket.js)

A singleton Socket.io client connects to the backend URL from `VITE_SERVER_URL`. A reactive `isConnected` ref tracks connection state and drives the Live/Disconnected indicator.

### Real-Time Sync with 5-Row Limit

Three socket events keep all browser tabs synchronized:

1. **`transaction-added`** — Prepends the new transaction to the array. If the array exceeds 5 items, the oldest is removed via `pop()`.

2. **`transaction-updated`** — Finds the matching transaction by `_id` and replaces it in-place. No reordering occurs.

3. **`transaction-deleted`** — Filters the transaction out of the array. If the currently-edited transaction is deleted by another tab, the edit form is automatically cancelled.

All listeners are registered in `onMounted` and cleaned up in `onUnmounted`. The component also detaches the same handlers before attaching them on mount to prevent duplicate listeners during remount scenarios.

### Animation

Vue's `<TransitionGroup>` with the `list-*` CSS classes provides:
- Slide-down entrance for new items
- Slide-down exit for deleted items
- Smooth repositioning when items shift via `.list-move`

## Running

```bash
cd client
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.
