# Art pipeline — 10 create + 10 merge (24/7 uniqueness)

Repo: `3XTRINITY-CORPORATION-AND-SOFTWARE/STEEL-AURA-ULTIMA`
Bible: `brand/interior/INTERIOR-BIBLE.md`
Evidence roots: `/workspace/art-lanes/NN/`

| Lane | Create agent | Merge agent | Prefix | Dest |
|------|--------------|-------------|--------|------|
| 01 | Art Meter Row | Merge Meter Row | `aura-meter-` | variants/aura/ |
| 02 | Art Neon Ring | Merge Neon Ring | `aura-ring-` | variants/aura/ |
| 03 | Art Magenta Desk | Merge Magenta Desk | `ultima-magenta-` | variants/ultima/ |
| 04 | Art Sync HUD | Merge Sync HUD | `ultima-sync-` | variants/ultima/ |
| 05 | Art Amber Haze | Merge Amber Haze | `aura-amber-` | variants/aura/ |
| 06 | Art VHS Street | Merge VHS Street | `ultima-vhs-` | variants/ultima/ |
| 07 | Art Motion Streak | Merge Motion Streak | `ultima-streak-` | variants/ultima/ |
| 08 | Art Neon Noir | Merge Neon Noir | `aura-noir-` | variants/aura/ |
| 09 | Art Grain Moon | Merge Grain Moon | `ultima-grain-` | variants/ultima/ |
| 10 | Art Advisory | Merge Advisory | `ultima-cover-` | variants/ultima/ |

## Uniqueness rules
1. One lane owns one filename prefix — never cross.
2. Before commit, checksum vs existing `brand/interior/**` — drop near-duplicates (identical sha256).
3. Merge agent opens PR `art/lane-NN-*` → `main`; merge when clean.
4. Create never force-pushes main; Merge never generates art.
5. Target ~5 assets per lane toward the 50-variant goal (shared with CoS GenerateImage heroes).
