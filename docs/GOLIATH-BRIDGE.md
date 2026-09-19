# Goliath OS bridge notes

`apps/os-host` should pull OS/kernel bridge patterns from private org repo
**goliathOS-2** (`3XTRINITY-CORPORATION-AND-SOFTWARE/goliathOS-2`).

## Clone status (2026-09-19 EEST)

Successfully cloned to `/workspace/goliathOS-2` via:

```bash
gh repo clone 3XTRINITY-CORPORATION-AND-SOFTWARE/goliathOS-2 /workspace/goliathOS-2
```

No auth blocker.

## Patterns to lift

| Area | goliathOS-2 path | STEEL target |
|------|------------------|--------------|
| Data-channel RTT ping | `src/lib/multiplayer/p2p.ts` | `PingClock` (adapt 250–500ms) |
| Path/delay kinematics | `src/lib/ether/kinematics.ts` | compensation alongside EWMA |
| Stall recovery | `src/lib/multiplayer/p2p.ts` | os-host anti-glitch |
| Kernel framing | `src/lib/ether/kernel.ts` | os-host command bus |

Sync budget: **±0.2s (200ms)** — `SyncBudget` / `PingClock` in `@steel-aura/sync-kernel`.

`/workspace/goliathOS-2` is a local working clone, not a submodule.
