# Server Documentation

## Overview

Express.js backend with Socket.io real-time communication and MongoDB persistence via Mongoose.

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP framework (v5) |
| `mongoose` | MongoDB ODM |
| `socket.io` | Real-time WebSocket server |
| `cors` | Cross-Origin Resource Sharing |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting on write endpoints |
| `dotenv` | Environment variable loading |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/transactions` | Fetch the 5 most recent transactions, sorted by `createdAt` descending |
| `POST` | `/api/transactions` | Create a new transaction. Body: `{ title: string, amount: number }` |
| `PUT` | `/api/transactions/:id` | Update an existing transaction. Body: `{ title: string, amount: number }` |
| `DELETE` | `/api/transactions/:id` | Delete a transaction by ID |

### Validation Rules

- **title**: Required, non-empty string, max 100 characters (trimmed).
- **amount**: Required, positive finite number.
- **:id**: Must be a valid MongoDB ObjectId.

### Response Codes

| Code | Meaning |
|------|---------|
| `200` | Successful read or update |
| `201` | Transaction created |
| `400` | Validation error (missing/invalid fields or ID) |
| `404` | Transaction not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

## Socket.io Event Map

### Server → Client (Emitted)

| Event | Payload | Trigger |
|-------|---------|---------|
| `transaction-added` | Full transaction object | After POST creates a new transaction |
| `transaction-updated` | Full updated transaction object | After PUT updates a transaction |
| `transaction-deleted` | `{ _id: string }` | After DELETE removes a transaction |

### Client → Server (Listened)

No custom client-to-server events are used. The server only emits broadcasts.

## MongoDB Configuration

Set the `MONGO_URI` environment variable in `server/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/transaction-tracker
CLIENT_ORIGIN=http://localhost:5173
```

### Transaction Schema

```js
{
  title:     { type: String, required: true, maxlength: 100 },
  amount:    { type: Number, required: true, min: 0.01 },
  createdAt: { type: Date, default: Date.now }
}
```

## Running

```bash
cd server
pnpm install
pnpm dev
```

The server uses Node.js 22+ native `--watch` mode for automatic restarts during development.
