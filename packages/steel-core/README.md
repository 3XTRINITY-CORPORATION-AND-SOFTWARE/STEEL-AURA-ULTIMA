# @steel-aura/steel-core

Mix engine for STEEL™ Ultima — **≥10 realtime named channels**, OS-first simultaneous play, sync-budget gated (±200ms).

## Default channels (10)

`kick`, `snare`, `hat`, `bass`, `pad`, `lead`, `fx`, `vocal`, `busA`, `busB`

Legacy desk was 6ch (`kick`…`vocal`); Ultima expands to ≥10.

## API

- Per channel: gain / mute / solo / pan / armed / playing
- Master bus: gain / mute
- `armAll()` + `playAllArmed()` — all armed on one timeline (no one-clip-only gate)
- `playSimultaneous()` — legacy alias (arms then plays)
- `AudioBackend` / `OsAudioHost` + `InMemorySimBackend` (CI, no hardware)
- Sync: attach `SyncPing` / `PingClock`; refuse when `|skew| > ±200ms`; else compensate

## Tests

```bash
npm run test:mix
# or
npx tsx --test packages/steel-core/src/mix-engine.test.ts
```
