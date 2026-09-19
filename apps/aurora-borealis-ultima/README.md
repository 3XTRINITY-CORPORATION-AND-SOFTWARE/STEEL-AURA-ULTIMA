# AURORA BOREALIS ULTIMA™

Music-video-class visualizer **UI shell** (branch `aurora-borealis-ultima`).

Visual twin to smaller AURA (`packages/aura-viz/vendor/smaller-aura-src`): void `#050505`, violet `#A855F7`, cyan aurora washes, glass panels, mono chips — editor feel for synced MP4 / art.

## Honesty

| Region | Status |
|--------|--------|
| Stage frequency bins | **SIM / MOCK** |
| AURA 1:1 Sync strip (±200ms) | **MOCK** adapter (ready for `packages/sync-kernel`) |
| Timeline + AI prompt | **MOCK** (provider pluggable, not wired) |
| Media / Memory banks | **PLACEHOLDER** |
| Journal fixture panel | **FIXTURE** read of `public/fixtures/demo-1000.json` |
| Production 1000:1000 | **NOT claimed** — needs aura-viz harness PASS |

## Run (dev)

```bash
cd apps/aurora-borealis-ultima
npm install
npm run dev
```

Opens Vite on port **5174** (or next free).

## Build

```bash
cd apps/aurora-borealis-ultima
npm install
npm run build    # must exit 0
npm run preview
```

## Journal reader (CLI)

```bash
npm run read-journal
# optional path:
npm run read-journal -- ../../packages/aura-viz/fixtures/demo-1000.json
```

Uses `packages/aura-viz` `validateJournal` when `dist/` is built; otherwise structural FIXTURE parse (not production 1000:1000).

## Layout

1. **Stage** — full-bleed canvas, aurora gradient + SIM bins
2. **AURA 1:1 Sync strip** — skew meter ±200ms · LOCKED/DRIFT
3. **Timeline** — audio + video scrubbers + AI prompt textarea
4. **Media / Memory banks** — placeholders
5. **Footer** — TRINITYWAYVE / Architect line

Contracts: `../../contracts/ULTIMA.md`, `../../contracts/AURA-1to1.md`, `../../contracts/SYNC.md`.
