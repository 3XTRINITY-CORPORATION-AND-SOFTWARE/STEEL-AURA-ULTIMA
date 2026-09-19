# Sync contract — web ↔ OS/phone kernel

## Goal
Minimize glitch + CPU overload while keeping **skew ≤ ±0.2s** (200ms) between web-host UI clock and OS/PC or phone kernel audio clock.

## Mechanisms
1. **Ping** — bidirectional RTT sample every 250–500ms (lab) / ~2s demo loop; EWMA latency
2. **Master clock** — AudioContext / OS audio device time is master on OS; web follows with delay compensation
3. **Combine** — UI schedules on compensated timeline; kernel executes; drop/merge frames if CPU > soft limit
4. **CPU governor** — if load high, reduce viz FFT size / channel meters before dropping audio

## Implementation (in-process / local)
- Package: `packages/sync-kernel/` — `SyncPingV1`, `SyncClock`, `measurePing` / `createPingLoop`, `recommendMode`
- Host demo: `apps/os-host/` — bridge emitting SyncPingV1 every ~2s
- Skew formula: `skewMs = tKernel - (tClient + rttMs/2)` (ms epoch stamps)
- Budget: `abs(skewMs / frameMs) ≤ 0.2` (default `frameMs=1000` → ±200ms)
- On breach: mode `safe_viz`; kernel remains audio SoT
- Transport WS / localhost HTTP between web-host ↔ os-host: **not shipped yet** (`fetchKernelStamp` hook ready)

See also: `docs/contracts/sync-budget.v1.md`, `docs/NORTH-STAR.md` §3.

## Acceptance
- Simultaneous play of ≥10 channels on OS without audible glitch under nominal load
- Measured skew p95 ≤ 200ms in lab harness
