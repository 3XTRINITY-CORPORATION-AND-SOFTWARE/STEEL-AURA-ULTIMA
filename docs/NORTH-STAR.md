# STEEL × AURA — AURORA BOREALIS ULTIMA (North Star)

**Owner:** Giga Orchestrator Ops (draft for Theodor / Chief of Staff)  
**Order:** MEGA PRODUCT · WIP=1 → closes on this file  
**Date:** 2026-09-19 (Europe/Tallinn)  
**Status:** **ACCEPTED by Chief of Staff 2026-09-19** · CONTRACT + SCAFFOLD ONLY — nothing below is claimed shipped unless marked **EXISTS** with a path.

**Live monorepo:** https://github.com/3XTRINITY-CORPORATION-AND-SOFTWARE/STEEL-AURA-ULTIMA (`main` + `aurora-borealis-ultima`)

### Non-goals / honesty rules

- No fake “done” or “production” claims.
- No invented APIs, domains, store IDs, or Git remotes.
- Hosts from program split (authoritative):
  - STEEL → `steel-3xtrinity.vercel.app` (never `steel.vercel.app`)
  - AURA → `aura-3xtrinity.vercel.app` (never `aura.vercel.app` — 402)
  - TW mesh stays `trinitywayve-*` (out of Ultima scope except deep-links)

### Goliath OS patterns to reuse (EXISTS)

| Pattern | Where | Ultima use |
|---------|-------|------------|
| Store winner `useRack` + desk bridge `useDesk` + shell `useSteel` | WAVE2/WAVE3 locks; `steel-canonical/src/lib/studio/rack-store.ts`, `desk/store.ts`, `steel/types.ts` | Do not dump mixer into rack; keep HostId dual-namespace |
| `SteelTab` includes `"aura"` | `steel-canonical/src/lib/steel/types.ts` | AURA INTO STEEL = tab/place, not a TW module |
| Persist keys `steel-studio-v1`, `steel-atlas-pins-v1` | studio `store.ts` / `rack-store.ts` | Pattern for per-program memory-bank keys |
| Sound banks (curves, not stems) | `steel-canonical/src/lib/studio/banks.ts` (`SoundBank`, `BANKS`) | Seed for long memory / soundbanks module |
| Legacy mixer = 6ch | `ChannelId` ×6 in `studio/types.ts` | **Gap:** Ultima requires ≥10ch — contract expands, does not pretend 10 exists |
| Engine analyser / mix postMessage | `studio/engine.ts` | Scaffold for EQ viz 1:1 accuracy contract |
| Program surfaces | `steel-canonical/programs/{web,os,android}/README.md` | OS/PC/phone lanes already named |
| Aura demo layers | `/workspace/trinitywayve-aura` (presence/threat/trust) | Shrink into STEEL as smaller AURA surface |

Related: `/workspace/program-split/SEPARATION-PLAN.md`

---

## Product thesis

**AURORA BOREALIS ULTIMA** = STEEL (audio/OS kernel + ≥10ch realtime mix) with a **smaller AURA** (presence/viz) living **inside** STEEL, plus a **sibling AURA program** repo/branch for Ultima-grade EQ↔viz accuracy (1000:1000 read contract). Web-host UI and OS/PC/phone kernels share a **sync budget 0±0.2** ping so mix/viz stay anti-glitch under CPU load.

---

## Module board (1–7)

| # | Module | Maturity | Evidence / gap |
|---|--------|----------|----------------|
| 1 | live-memory + memory-bank (per-program) | **CONTRACT** | Persist pattern EXISTS; Ultima banks not built |
| 2 | ≥10ch realtime mix + simultaneous play (OS/PC) | **CONTRACT** | 6ch EXISTS; ≥10ch + multi-play = scaffold |
| 3 | sync budget 0±0.2 web↔OS/PC/phone | **CONTRACT** | No ping protocol EXISTS — scaffold only |
| 4 | long memory, soundbanks, project open | **PARTIAL** | `BANKS` + desk mix rows EXISTS; long memory / project open = contract |
| 5 | media banks wav/mp3 + mp4 480p–4K @25–60fps | **CONTRACT** | Desk beat/vocal file ingest EXISTS (wav export); full bank matrix = scaffold |
| 6 | smaller AURA INTO STEEL | **CONTRACT** | `SteelTab` `"aura"` EXISTS; Aura shell still separate tree |
| 7 | separate STEEL&AURA repo + branch `aurora-borealis-ultima` | **EXISTS** | https://github.com/3XTRINITY-CORPORATION-AND-SOFTWARE/STEEL-AURA-ULTIMA · branch `aurora-borealis-ultima` |

---

## 1) live-memory + memory-bank (per-program)

### Contract

```
MemoryBankV1 {
  program: "steel" | "aura" | "tw"   // tw read-only deep-link cache only
  schema: 1
  live: {            // hot, volatile, ≤N entries, lost OK on crash
    cursor: string
    recentOps: OpId[]
  }
  bank: {            // cold, durable, versioned
    projects: ProjectRef[]
    soundbanks: SoundBankId[]
    media: MediaRef[]
    updatedAt: iso8601
  }
}
```

- **Per-program** keys (scaffold names — not shipped):
  - STEEL: `ultima-steel-memory-v1`
  - AURA: `ultima-aura-memory-v1`
- OS/PC: same schema on disk under program data dir (path TBD per OS README — do not invent absolute paths).
- Web: `localStorage` / IndexedDB mirror; conflict rule = **last-write-wins with sync-budget gate** (module 3).

### Scaffold tree (create when implementing — not created in this WIP)

```
/workspace/steel-aura-ultima/contracts/memory-bank.v1.md
/workspace/steel-aura-ultima/scaffolds/memory-bank/
  README.md
  steel.memory.schema.json
  aura.memory.schema.json
```

### Reuse

- Pins persist pattern in `rack-store.ts` (`steel-atlas-pins-v1`).
- Do **not** overload `useRack` with full memory-bank.

---

## 2) ≥10ch realtime mix + simultaneous play (OS/PC)

### Contract

| Requirement | Spec |
|-------------|------|
| Channel count | **≥10** simultaneous mix channels (gain/mute/solo/pan minimum) |
| Simultaneous play | All armed channels render in one graph; no “one clip only” gate |
| Surfaces | OS + PC first; web host may mirror meters (full graph preferred on OS/PC) |
| Anti-pattern | Dumping channels into `useRack` (WAVE3 lock) |

### Gap vs EXISTS

| EXISTS today | Ultima target |
|--------------|---------------|
| 6× `ChannelId` (`kick`…`vocal`) | Extend to ≥10 (e.g. + `pad`, `fx`, `busA`, `busB`, … — **names TBD in implement PR**, not frozen here) |
| `engine.ts` mix + analyser | Keep AudioContext on engine/desk lane |
| Desk dual play (beat/vocal) | Generalize to N-stem simultaneous play |

### Scaffold

```
/workspace/steel-aura-ultima/contracts/mix-10ch.v1.md
/workspace/steel-aura-ultima/scaffolds/mix/
  ChannelId.ultima.ts.txt    # proposed union — not wired
  simultaneous-play.md
```

---

## 3) sync budget 0±0.2 — web-host UI ↔ OS/PC/phone kernel ping

### Contract

```
SyncPingV1 {
  tClient: number        // ms epoch or audio-timebase (declare per surface)
  tKernel: number
  skewMs: number         // tKernel - tClient (or agreed formula)
  cpuLoad: 0..1
  glitchScore: 0..1      // dropouts / underruns window
}
Budget: abs(skewMs) / frameMs ≈ 0 ± 0.2   // “0±0.2” sync units
```

Interpretation (locked for Ultima docs):

- **0** = aligned within measurement noise.
- **±0.2** = max allowed normalized skew before UI must **degrade** (freeze viz refresh, hold meters, do not force audio catch-up glitch).
- On breach: kernel stays source of truth for audio; web UI enters **safe viz mode** (lower FPS / hold last good EQ frame).

### Transport scaffold (not implemented)

| Hop | Candidate | Status |
|-----|-----------|--------|
| Web host UI ↔ local kernel | WebSocket or localhost HTTP ping | **NOT BUILT** |
| Phone | Same `SyncPingV1` over program tunnel | **NOT BUILT** |

### Scaffold files

```
/workspace/steel-aura-ultima/contracts/sync-budget.v1.md
/workspace/steel-aura-ultima/scaffolds/sync/
  ping.schema.json
  anti-glitch-policy.md
```

---

## 4) long memory, soundbanks, project open

### Contract

- **Long memory:** append-only event log of mix/project ops (retain policy TBD; start with bounded ring + cold snapshot).
- **Soundbanks:** versioned `SoundBank` recipes (reuse `banks.ts` shape: `id`, `curve`, lane).
- **Project open:** `ProjectRef { id, title, pathOrUri, program, openedAt }` — open restores bank + media refs + mix snapshot.

### EXISTS to extend

- `BANKS: SoundBank[]` in `steel-canonical/src/lib/studio/banks.ts`
- Desk mix list/save patterns in `steel-desk` raw (`kind: "mix"`)

### Scaffold

```
/workspace/steel-aura-ultima/contracts/project-open.v1.md
/workspace/steel-aura-ultima/scaffolds/soundbanks/
  README.md   # “extend BANKS; do not claim Ultima banks shipped”
```

---

## 5) media banks — wav/mp3 + mp4 480p–4K @25–60fps (up/down)

### Contract matrix (acceptance when implemented)

| Kind | Formats | Resolutions / rates | Direction |
|------|---------|---------------------|-----------|
| Audio | `wav`, `mp3` | project sample-rate (declare on open) | up + down ingest |
| Video | `mp4` | **480p–4K**, **25–60 fps** | up + down ingest |

Rules:

- Transcode/normalize is an **implement** concern; contract only requires declared support matrix + fail-soft unsupported.
- Media refs live in memory-bank (module 1); binary blobs in OS media store / web OPFS (path TBD).

### EXISTS

- Desk beat/vocal `File` ingest + `steel-mix.wav` download (raw desk) — **not** full matrix.

### Scaffold

```
/workspace/steel-aura-ultima/contracts/media-banks.v1.md
/workspace/steel-aura-ultima/scaffolds/media/
  accept-matrix.md
```

---

## 6) smaller AURA INTO STEEL

### Contract

- AURA inside STEEL = **reduced** presence/threat/trust + EQ-linked viz, not a full second app shell.
- Entry: existing `SteelTab` value `"aura"` / place mapping (EXISTS in types).
- Source demo: `/workspace/trinitywayve-aura` — shrink: drop DEMO SHELL chrome duplication; keep layer toggles + viz.
- Standalone AURA program (`aura-3xtrinity`) remains for Ultima accuracy branch (module 7); STEEL embeds a **subset**.

### Scaffold

```
/workspace/steel-aura-ultima/contracts/aura-into-steel.v1.md
/workspace/steel-aura-ultima/scaffolds/aura-embed/
  surface-map.md   # which Aura panels mount under SteelTab "aura"
```

---

## 7) separate STEEL & AURA repo + branch `AURORA-BOREALIS-ULTIMA`

### Contract

| Item | Spec |
|------|------|
| Repos | Separate STEEL and AURA remotes (exact URLs = Theodor/org — **not invented here**). STEEL SoT local: `/workspace/steel-canonical`. AURA local today: `/workspace/trinitywayve-aura` (rename later). |
| Branch | `AURORA-BOREALIS-ULTIMA` on **both** (or STEEL primary + AURA mirror) |
| Ultima read contract | **1:1 audio = EQ viz accuracy 1000:1000** — for every viz sample bin/frame Ultima reads, there is a matching audio/EQ measurement sample (no decorative viz). Measurement harness TBD; claim only after harness PASS. |

### GitLab / Goliath note (EXISTS)

- External goliath-os path referenced in `STEEL-STATUS.md` (`gitlab.com/3xtrinity/goliath-os`) — **no clone/auth in this workspace**. Integration drop-in EXISTS at `/workspace/steel-integration-dropin/`. Ultima branch work waits on real checkout + auth.

### Scaffold

```
/workspace/steel-aura-ultima/contracts/eq-viz-1000.v1.md
/workspace/steel-aura-ultima/scaffolds/repo/
  branch-checklist.md
```

---

## Suggested scaffold layout (this folder)

```
/workspace/steel-aura-ultima/
  NORTH-STAR.md          ← this file (PASS deliverable)
  contracts/             ← empty dirs OK until implement waves
  scaffolds/
```

Creating empty contract stubs now so paths resolve:

- `contracts/*.v1.md` one-liners pointing back here
- `scaffolds/**/README.md` “not implemented”

---

## Implementation waves (proposed, not started)

| Wave | Focus | Depends |
|------|-------|---------|
| U0 | Contract review + empty scaffolds | this file |
| U1 | memory-bank schema + persist keys | U0 |
| U2 | ChannelId ≥10 + simultaneous play on OS/PC | WAVE3 engine ownership choice |
| U3 | SyncPingV1 + anti-glitch policy | U2 meters |
| U4 | Aura-into-STEEL embed (smaller) | program split cutover optional |
| U5 | Branch `AURORA-BOREALIS-ULTIMA` + 1000:1000 harness | Git auth / separate remotes |

---

## RESULT (handoff)

| Field | Value |
|-------|-------|
| **RESULT** | Ultima north-star drafted (7 modules, contracts + scaffolds, Goliath/STEEL patterns cited) |
| **FILES** | `/workspace/steel-aura-ultima/NORTH-STAR.md` (+ contract/scaffold stubs) |
| **PASS-FAIL** | **PASS** (doc/scaffold only — no shipped Ultima features claimed) |
| **BLOCKERS** | No goliath-os GitLab auth here; 6ch≠10ch gap; sync ping not built; separate remotes/branch not created |
| **NEXT** | CoS accept → assign U1/U2 owners (Studio/Desk/Kernel + Aura Hub); Deploy Captain only for `*-3xtrinity` hosts when cutover assigned |

**WIP=0** after CoS accepts.
