# mix-10ch.v1

**Status:** deepened in `@steel-aura/steel-core` (WIP — sim backend; not production device)  
**Owner:** U1 Mix — Steel Studio (`packages/steel-core`)  
**See also:** `contracts/MIX.md`, NORTH-STAR §2

## Requirements (locked)

| Requirement | Spec |
|-------------|------|
| Channel count | **≥10** simultaneous mix channels (`MIN_CHANNELS`) |
| Per-channel | gain, mute, solo, pan; armed / playing |
| Master | gain, mute |
| Simultaneous play | `playAllArmed()` / `playSimultaneous()` — one timeline; no one-clip-only gate |
| Surfaces | OS/PC first; `AudioBackend` / `OsAudioHost`; `InMemorySimBackend` for CI |
| Sync | Gates on sync-kernel ±200ms (`SYNC_BUDGET_MS`) when `SyncPing` attached |

## Default ChannelId set

`kick`, `snare`, `hat`, `bass`, `pad`, `lead`, `fx`, `vocal`, `busA`, `busB`

## Not in this deepen

- Web UI meters / AudioWorklet
- Real OS device backend (interface only)
