# sync-budget.v1

**Status:** IMPLEMENTED in-process / local (`packages/sync-kernel`). Cross-process WS transport not built.

## SyncPingV1

| Field | Type | Notes |
|-------|------|-------|
| tClient | number | ms epoch (`Date.now`) |
| tKernel | number | ms epoch |
| skewMs | number | `tKernel - (tClient + rttMs/2)` |
| cpuLoad | 0..1 | |
| glitchScore | 0..1 | dropouts / underruns window |

## Budget

```
normalizedSkew = skewMs / frameMs
abs(normalizedSkew) ≤ 0.2
```

- Default `frameMs = 1000` → **±200ms** hard ceiling
- Helper: `FRAME_MS_60FPS` ≈ 16.67ms for sub-frame budgets

On breach → UI mode `safe_viz` (degrade viz); kernel stays audio source of truth.

## Code

- `packages/sync-kernel/src/` — types, clock, ping, governor
- `apps/os-host/src/` — host bridge demo
- North-star narrative: `docs/NORTH-STAR.md` §3

## MixEngine wire (U1)

`MixEngine.playAllArmed()` uses `SyncPing` / `PingClock` + `withinBudget` / `compensationDelayMs` / `SYNC_BUDGET_MS` (±200):

1. Read `measuredSkewMs()`
2. Outside budget → refuse (default)
3. Inside → schedule at `nowMs + compensationDelayMs(skew)`

CPU governor: `CpuGovernor` / `recommendMode` — reduce meters/viz before audio.

