# OUTCOME — MixEngine ≥10ch + sync budget wire

**Agent:** Steel Studio / CoS assign (ULTIMA WIP)  
**Date:** 2026-09-19 (Europe/Tallinn, EEST)  
**Branch:** `feat/mixengine-10ch-sync`  
**Base:** `main`

## RESULT

**PASS** — MixEngine deepened to ≥10 named channels with simultaneous `playAllArmed()`, mute/solo/gain/pan/master, OS-first `AudioBackend` + `InMemorySimBackend`, and sync budget ±200ms wired into scheduling. PR opened to `main`.

## FILES

### steel-core
- `packages/steel-core/src/types.ts` — DEFAULT_CHANNEL_IDS (10 named)
- `packages/steel-core/src/audio-backend.ts` — AudioBackend / OsAudioHost / InMemorySimBackend
- `packages/steel-core/src/mix-engine.ts` — MixEngine deepen (named ch, arm, pan, playAllArmed, sync gate)
- `packages/steel-core/src/mix-engine.test.ts` — unit tests
- `packages/steel-core/src/index.ts` — public API
- `packages/steel-core/README.md`

### contracts / docs
- `docs/contracts/mix-10ch.v1.md`
- `docs/contracts/sync-budget.v1.md` (MixEngine wire note)
- `docs/OUTCOME-MIXENGINE-10CH.md` (this file)
- `package.json` — `test` / `test:mix` / `test:sync` scripts

### sync-kernel (already on main; reused)
- `SYNC_BUDGET_MS` (±200), `withinBudget`, `compensationDelayMs`, `PingClock`/`SyncPing`, EWMA RTT, CpuGovernor

## CHANGED

- Channel capacity: **10** named IDs (`kick`…`busB`); enforces ≥10
- Simultaneous play: `armAll()` + `playAllArmed()` — one `startAtMs` for all armed
- Sync budget: hard ceiling **±200ms**; refuse outside; compensate inside
- OS-first: abstract `AudioBackend`; CI uses `InMemorySimBackend`

## TEST

```bash
npx tsx --test packages/steel-core/src/mix-engine.test.ts packages/sync-kernel/src/smoke.test.ts
# or
npm test
```

## PASS / FAIL

| Check | Result |
|-------|--------|
| ≥10 named channels | PASS |
| arm all + simultaneous play | PASS |
| mute / solo / gain / pan | PASS |
| master mute | PASS |
| refuse skew > ±200ms | PASS |
| compensate within budget | PASS |
| sync-kernel smoke (EWMA / budget / governor) | PASS |
| **Total** | **13/13 pass** |

## BLOCKERS

- Shared checkout contention → work done in git worktree `/workspace/STEEL-MIX-WT` (same repo).
- Real OS audio device backend not implemented (abstract interface only — by design).
- Cross-process WS ping transport still not built.

## NEXT

- Real `AudioBackend` against OS device clock
- Live os-host ↔ MixEngine ping loop
- Web meter mirror (out of scope)

## PR URL

(pending — filled after `gh pr create`)
