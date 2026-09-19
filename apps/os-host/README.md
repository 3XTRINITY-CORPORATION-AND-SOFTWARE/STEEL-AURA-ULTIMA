# @steel-aura-ultima/os-host

PC kernel bridge demo — **Goliath-inspired** `SyncClock` (ether ticks/uptime) + ping loop (`PING_INTERVAL` ~2s) emitting `SyncPingV1`.

Depends on `@steel-aura-ultima/sync-kernel` (in-process / local; WS transport later).

## Run

From monorepo root:

```bash
npm run os-host
# or
npx tsx apps/os-host/src/main.ts
```

Optional: `OS_HOST_DEMO_MS=10000` to keep the demo alive longer (default ~6.5s).

## Bridge API

```ts
import { startHostSync, stopHostSync, getLastPing } from "./bridge.ts";

startHostSync({
  onPing: (result, ticks) => { /* SyncPingV1 + mode */ },
});
```

## Notes

- Sync budget ±0.2 (normalized) — see `packages/sync-kernel` and `docs/contracts/sync-budget.v1.md`.
- Patterns pulled read-only from goliathOS-2 ether kernel ticks/uptime + p2p ping RTT.
- STEEL hub remains https://steel-3xtrinity.vercel.app (no invented domains).
