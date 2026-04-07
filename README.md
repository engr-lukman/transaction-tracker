# Real-Time Transaction Tracker

Production-ready monorepo for a real-time transaction dashboard.

## Repository Structure

- [client](client) - Vue 3 + Vite + Tailwind CSS 4 frontend
- [server](server) - Node.js + Express + Socket.io + MongoDB backend

## Documentation

- [Client Guide](client/CLIENT.md)
- [Server Guide](server/SERVER.md)

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Configure environments:

- Copy [server/.env.example](server/.env.example) to [server/.env](server/.env).
- Ensure [client/.env](client/.env) has the correct API URL.

3. Run both apps:

```bash
cd server && pnpm dev
cd client && pnpm dev
```

## Production Scripts

- Backend:
     - `pnpm --filter transaction-tracker-server build`
     - `pnpm --filter transaction-tracker-server start`
- Frontend:
     - `pnpm --filter transaction-tracker-client build`
     - `pnpm --filter transaction-tracker-client start`
