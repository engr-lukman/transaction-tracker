# Client Documentation

Vue 3 (Composition API) frontend with Vite, Tailwind CSS 4, and Socket.io real-time synchronization.

## Architecture

The client follows **industry-standard layered architecture** with clear separation of concerns:

```
src/
  config/             # Configuration and constants
    api.js           # API endpoints and base URL
    constants.js     # App-wide constants (validation, UI, messages)
  services/          # API communication layer
    transactionApi.js # Transaction CRUD operations
  composables/       # Reusable stateful logic
    useTransactionForm.js    # Form state and validation
    useTransactionList.js    # List management operations
    useTransactionSocket.js  # Socket.io event handling
  components/        # Vue components
    layout/
      AppLayout.vue          # Main layout wrapper
    ui/
      StatusIndicator.vue    # Connection status display
      TransactionForm.vue    # Add/Update form
      TransactionList.vue    # Transaction list container
      TransactionListItem.vue # Individual transaction item
  utils/            # Helper functions
    formatting.js   # formatAmount(), timeAgo()
  App.vue           # Main app component (orchestrator)
  main.js           # Entry point
  socket.js         # Socket.io client singleton
  style.css         # Tailwind CSS styles
```

## Layer Responsibilities

### Config (`src/config/`)
- **api.js**: API endpoints, base URLs, configuration constants
- **constants.js**: Validation rules, UI limits, message strings, socket event names

### Services (`src/services/`)
- **transactionApi.js**: HTTP requests (fetch, create, update, delete)
  - Pure API communication
  - Centralized error handling
  - Exported async functions: `fetchTransactions()`, `createTransaction()`, `updateTransaction()`, `deleteTransaction()`

### Composables (`src/composables/`)
Reusable state and logic encapsulated as Vue composables

- **useTransactionForm**: Form state management
  - Reactive refs: `title`, `amount`, `submitting`, `error`, `editingId`
  - Computed: `isEditing`
  - Methods: `handleSubmit()`, `validateForm()`, `startEdit()`, `cancelEdit()`

- **useTransactionList**: List operations
  - Reactive refs: `transactions` array
  - Methods: `setTransactions()`, `addTransaction()`, `updateTransaction()`, `removeTransaction()`, `isEmpty()`

- **useTransactionSocket**: Socket.io lifecycle
  - Registers/cleans up event listeners on mount/unmount
  - Callback handlers for `transaction-added`, `transaction-updated`, `transaction-deleted` events

### Components (`src/components/`)

**Layout:**
- **AppLayout.vue**: Responsive grid container (mobile-first, sticky sidebar at lg)
  - Props: `isConnected` (boolean)
  - Slot: Main content

**UI Components (in `ui/` folder):**
- **StatusIndicator.vue**: Live/Disconnected indicator
  - Props: `isConnected`
  - Visual: Pulsing green dot (live) or red dot (disconnected)

- **TransactionForm.vue**: Form for adding/updating transactions
  - Props: `title`, `amount`, `error`, `submitting`, `isEditing`
  - Events: `@submit`, `@cancelEdit`, `@update:title`, `@update:amount`
  - Features: Validation messages, conditional button labels

- **TransactionListItem.vue**: Single transaction row
  - Props: `transaction`, `isConfirmingDelete`
  - Events: `@edit`, `@delete`, `@toggleConfirm`
  - Features: Edit/Delete buttons, delete confirmation UI

- **TransactionList.vue**: List container with animations
  - Props: `transactions`, `confirmDeleteId`
  - Events: `@edit`, `@delete`, `@toggleConfirm`
  - Features: Empty state, TransitionGroup animations (slide/fade)

### Utils (`src/utils/`)
- **formatting.js**:
  - `formatAmount(value)`: Format number as USD currency
  - `timeAgo(dateStr)`: Convert ISO date to relative time (e.g., "5m ago")

## Data Flow

### Adding a Transaction
```
App.vue (onFormSubmit)
  → useTransactionForm.handleSubmit()
    → transactionApi.createTransaction(payload)
      → HTTP POST /api/transactions
      → Backend broadcasts: transaction-added event
  → Socket listener (onAdded)
    → useTransactionList.addTransaction()
    → Reactive update → UI re-renders
```

### Updating a Transaction
```
TransactionList → App.vue (onEditTransaction)
  → useTransactionForm.startEdit(transaction)
    → Populate form fields
  → User modifies form
  → onFormSubmit()
    → useTransactionForm.handleSubmit()
      → transactionApi.updateTransaction(id, payload)
        → HTTP PUT /api/transactions/:id
        → Backend broadcasts: transaction-updated event
  → Socket listener (onUpdated)
    → useTransactionList.updateTransaction()
    → In-place replacement → UI re-renders
```

### Deleting a Transaction
```
TransactionListItem → App.vue (onDeleteTransaction)
  → transactionApi.deleteTransaction(id)
    → HTTP DELETE /api/transactions/:id
    → Backend broadcasts: transaction-deleted event
  → Socket listener (onDeleted)
    → useTransactionList.removeTransaction()
    → If editing, useTransactionForm.cancelEdit()
    → Reactive update → UI re-renders
```

## Tailwind CSS 4 Setup

**CSS-first configuration** (no `tailwind.config.js` needed)

Entry point: `src/style.css`

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

Custom colors used as Tailwind utilities: `bg-primary`, `text-danger`, `border-warning`, etc.

## Responsive Layout

- **Mobile-first grid**: `grid grid-cols-1 gap-6 lg:grid-cols-3`
  - Mobile (< lg): Single column stack
  - Desktop (lg+): 3-column grid
    - Left (1 col): Sticky sidebar form at `lg:top-8`
    - Right (2 col): Transaction list

- **Component spacing**: `min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8`

- **Transaction items**: Flex layout switches at `sm` breakpoint
  - Mobile: Column stack (title, time, amount stacked)
  - Tablet+: Row layout (title + time left, amount right)

## Real-Time Sync with Socket.io

### Connection
- Singleton Socket.io client in `src/socket.js`
- Server URL from `VITE_SERVER_URL` env var (default: http://localhost:3001)
- Reactive `isConnected` ref tracks connection state

### Events
- **`transaction-added`**: New transaction (prepend to list, enforce 5-item max)
- **`transaction-updated`**: Modified transaction (in-place replace)
- **`transaction-deleted`**: Removed transaction (filter out, cancel edit if same)

### Constraints
- **Max Display**: 5 transactions (enforced in `useTransactionList.addTransaction()`)
- **Listeners**: Attached on mount, detached on unmount (with pre-detach to prevent duplicates)

## State Management

**No centralized state store** (Pinia/Vuex not needed)

- Form state: `useTransactionForm` composable
- List state: `useTransactionList` composable
- Connection state: `isConnected` ref from `socket.js`
- Confirmation state: `confirmDeleteId` ref in App.vue

Each composable is **self-contained** and can be tested independently.

## Running

```bash
cd client
pnpm install
pnpm dev
```

Access at http://localhost:5173

## Build

```bash
pnpm build
```

Produces optimized bundle in `dist/`

## Environment Variables

Create `.env` file in `client/` folder:

```
VITE_SERVER_URL=http://localhost:3001
```

## API Specification

| Method | Endpoint             | Payload                    | Response                  |
|--------|----------------------|----------------------------|---------------------------|
| GET    | `/api/transactions`  | —                          | `Transaction[]`           |
| POST   | `/api/transactions`  | `{title, amount}`          | `{_id, title, amount, ...}` |
| PUT    | `/api/transactions/:id` | `{title, amount}`        | Updated transaction       |
| DELETE | `/api/transactions/:id` | —                        | Success or error          |

### Transaction Schema
```json
{
  "_id": "ObjectId",
  "title": "string (max 100 chars)",
  "amount": "number (>= 0.01)",
  "createdAt": "ISO 8601 timestamp"
}
```