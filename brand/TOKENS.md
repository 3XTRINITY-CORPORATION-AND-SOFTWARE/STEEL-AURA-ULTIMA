# AURA™ + Ultima™ — Token sheet

**Source:** [`interior/INTERIOR-BIBLE.md`](./interior/INTERIOR-BIBLE.md) (Theodor STEEL STUDIO console refs)  
**CSS:** [`tokens.css`](./tokens.css)  
**Updated:** 2026-09-19 (Europe/Tallinn) · Lore & Brand

## Locked hex (single values from bible ranges)

| Token | Hex | Role |
|-------|-----|------|
| `void-black` | `#050508` | walls, panels, crushed shadows |
| `steel-matte` | `#1a1c22` | desk body |
| `vu-green` | `#39ff14` | VU meters (peak) |
| `vu-green-soft` | `#00ff88` | pharmacy-cross / soft meter energy |
| `neon-cyan` / `cyan-edge` | `#00e5ff` | STEEL/AURA calm edge, radar calm |
| `neon-magenta` / `magenta-underglow` | `#ff2bd6` | Ultima underglow, neon script |
| `amber-canopy` | `#ffb020` | warm volume light / haze |
| `led-red` | `#ff1a1a` | knob LEDs |
| `radar-blue` | `#3aa0ff` | sync radar |

## Product skins

### AURA™
- Dominant: **cyan edge** + **vu-green**
- Magenta: muted underglow only (`~22%` mix)
- Grain: light
- CSS: `[data-brand="aura"]` or `.theme-aura`

### AURORA BOREALIS ULTIMA™
- Dominant: **magenta underglow** + aurora washes
- Retain vu-green meters; cyan as secondary edge
- Amber canopy haze behind console
- CSS: `[data-brand="ultima"]` or `.theme-ultima`

## Motif → token map (refs)

| Ref | Motif | Tokens to emphasize |
|-----|-------|---------------------|
| `01-meter-row-console` | VU row + cyan edge | `vu-green`, `cyan-edge`, `void-black` |
| `02-pink-underglow-radar` | Magenta underglow + radar | `magenta-underglow`, `radar-blue`, `vu-green` |
| `03-neon-ring-logo` | Green ring + pink wordmark | `vu-green`, `neon-magenta` |
| `04-magenta-desk-logo` | Magenta desk splash | `neon-magenta`, `steel-matte` |
| `05-*-ring` | Energy / sync ring HUD | `neon-cyan`, `vu-green`, `radar-blue` |

## Drift notes (fix against app CSS)

| Location | Current | Expected (this sheet) |
|----------|---------|------------------------|
| `apps/aurora-borealis-ultima/src/index.css` `--void` | `#050505` | prefer `#050508` for interior SoT (or alias) |
| same `--cyan` | `#22d3ee` | align to `#00e5ff` (`neon-cyan`) |
| TrinityWayve platform void | `#050505` | keep for TW hubs; Ultima interior uses `void-black` |

## Usage

```css
@import "../../brand/tokens.css";
/* or copy :root + [data-brand] blocks into app index.css */
```

```html
<html data-brand="aura">
<!-- or data-brand="ultima" -->
```
