# Server Documentation

Node.js + Express backend for the real-time transaction tracker.

## Architecture

Layered structure under [server/src](src):

- [src/config/env.js](src/config/env.js): environment parsing and runtime flags.
- [src/config/database.js](src/config/database.js): MongoDB singleton connection lifecycle.
- [src/models/transaction.model.js](src/models/transaction.model.js): Mongoose model.
- [src/validations/transaction.validation.js](src/validations/transaction.validation.js): request payload and id validation.
- [src/services/transaction.service.js](src/services/transaction.service.js): database operations.
- [src/controllers/transaction.controller.js](src/controllers/transaction.controller.js): HTTP handlers.
- [src/routes/transaction.routes.js](src/routes/transaction.routes.js): API routing + write rate limiter.
- [src/socket/socket.js](src/socket/socket.js): Socket.io initialization and safe event emits.
- [src/middlewares/error-handler.js](src/middlewares/error-handler.js): not-found and global error handlers.
- [src/app.js](src/app.js): Express app composition.
- [src/server.js](src/server.js): HTTP server bootstrap and graceful shutdown.
- [index.js](index.js): thin entrypoint.

## Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP server framework |
| mongoose | MongoDB ODM |
| socket.io | Real-time events |
| cors | Strict CORS origin control |
| helmet | Secure HTTP headers |
| express-rate-limit | Brute-force and abuse mitigation |
| dotenv | Environment variable loading |

## Environment Variables

Set values in [server/.env](.env):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/transaction-tracker
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/transactions | Returns latest 5 transactions (sorted by createdAt desc) |
| POST | /api/transactions | Creates transaction and emits `transaction-added` |
| PUT | /api/transactions/:id | Updates transaction and emits `transaction-updated` |
| DELETE | /api/transactions/:id | Deletes transaction and emits `transaction-deleted` |
| GET | /health | Health check |

## Socket Events

Server emits:

- `transaction-added`
- `transaction-updated`
- `transaction-deleted`

## Run

```bash
cd server
pnpm install
pnpm dev
```

Production:

```bash
pnpm build
pnpm start
```
