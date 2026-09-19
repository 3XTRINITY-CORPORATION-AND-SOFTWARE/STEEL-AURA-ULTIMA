# STEEL™ & AURA™ Ultima

Combined program monorepo — STEEL™ (sound / desk / kernel) + smaller AURA™ (frequency viz) integrated **into** STEEL as originally designed, plus branch **AURORA BOREALIS ULTIMA™** for 1:1 synced music-video / art generation.

## Brands
- **STEEL™** — OS / web / android host, ≥10-ch realtime mix, memory banks, media I/O
- **AURA™ (smaller)** — 1:1 audio↔EQ visualizer accuracy (target 1000:1000) embedded in STEEL
- **AURORA BOREALIS ULTIMA™** — visualizer that reads AURA frequency sync + AI to build MP4 art/music videos

## Sync budget
Web-host UI ↔ OS/PC or phone kernel ping: **0 ± 0.2** (units: seconds unless otherwise noted in contracts — implementers treat as **±200ms** hard ceiling for transport+render skew; strive sub-frame where AudioContext allows).

## Layout
- `packages/steel-core` — mix engine, channels (≥10), project open
- `packages/aura-viz` — smaller AURA 1:1 EQ/frequency pattern sync code
- `packages/sync-kernel` — ping / clock / anti-glitch / CPU governor hooks
- `packages/memory-bank` — live-memory + long-term memory banks
- `packages/media-bank` — wav/mp3 + mp4 480p–4K @25–60fps up/down per bank
- `apps/web-host` — UI host
- `apps/os-host` — PC kernel bridge (Goliath OS patterns)
- `apps/aurora-borealis-ultima` — Ultima visualizer app (also `aurora-borealis-ultima` branch)

## Source rights
For work on STEEL™ / AURA™ / Ultima: org repos, forks, and branches may be copied, mutated, formulated, and reverse-engineered per Theodor standing order (2026-09-19).
