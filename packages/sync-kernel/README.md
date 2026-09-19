# @steel-aura-ultima/sync-kernel

**Status: IMPLEMENTED (in-process / local)** — SyncPingV1 clock, ping loop, budget check, anti-glitch governor.

WebSocket / localhost HTTP transport between web-host and os-host is **not** shipped yet; `createPingLoop` accepts an optional `fetchKernelStamp` hook for that later.

## Sync budget

`abs(normalizedSkew) ≤ 0.2` where `normalizedSkew = skewMs / frameMs`.

- Default `frameMs = 1000` → **±200ms** hard ceiling (matches root README / NORTH-STAR).
- Export `FRAME_MS_60FPS` (~16.67ms) for sub-frame budgets when AudioContext allows.

### Skew formula

```
oneWayMs = rttMs / 2
skewMs   = tKernel - (tClient + oneWayMs)
```

`tClient` / `tKernel` are **ms epoch** (`Date.now`).

On breach → mode `safe_viz` (UI degrades). Kernel remains audio source of truth.

## Goliath lineage (read-only patterns)

- **SyncClock** — ether-kernel `ticks` / uptime syscall idea → monotonic `now()` + tick counter.
- **Ping loop** — p2p `PING_INTERVAL_MS = 2000` → `createPingLoop` default cadence.

## API

```ts
import {
  SyncClock,
  measurePing,
  createPingLoop,
  checkBudget,
  recommendMode,
  PING_INTERVAL_MS,
} from "@steel-aura-ultima/sync-kernel";
```

## Test

```bash
npm run test:sync
```

## Contracts

- `contracts/SYNC.md`
- `docs/contracts/sync-budget.v1.md`
- `docs/NORTH-STAR.md` §3
