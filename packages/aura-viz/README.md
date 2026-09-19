# @3xtrinity/aura-viz

Smaller **AURA™** package embedded INTO STEEL: **FrequencyPatternJournal** for 1:1 audio↔EQ/viz sync.

## 1000:1000 meaning (contract class)

From `contracts/AURA-1to1.md` / NORTH-STAR §7:

- **One** visual frame/bin update class **per** audio analysis hop.
- No decorative viz samples without a paired audio/EQ measurement.
- Label **`1000:1000`** is the **contract accuracy class**, not an automatic production claim.

**Honesty rule:** do **not** claim production 1000:1000 accuracy until `npm run harness` (or equivalent) **PASS**es on the journal under test. Fixture PASS ≠ production accuracy.

## How Ultima reads the journal

1. Smaller AURA records paired hops → JSON sidecar (`FrequencyPatternJournal.toJSON()`).
2. Sidecar lives next to media (see `contracts/MEDIA.md` — pattern-sync sidecar).
3. **AURORA BOREALIS ULTIMA™** loads JSON via `FrequencyPatternJournal.fromJSON` / `fromDocument`, then `assertOneToOne` / `validateJournal`.
4. App stub: `apps/aurora-borealis-ultima/scripts/read-fixture.mjs`.

```ts
import {
  FrequencyPatternJournal,
  assertOneToOne,
  ACCURACY_CLASS_1000,
} from '@3xtrinity/aura-viz'

const journal = FrequencyPatternJournal.fromJSON(fs.readFileSync('track.aura-journal.json', 'utf8'))
journal.assertOneToOne({ requireContiguousHops: true })
// … drive MP4 timeline from journal.entries()
```

## API surface

| Export | Role |
|--------|------|
| `FrequencyPatternJournal` | Record / read / serialize paired hops |
| `validateJournal` | Soft validation → `{ ok, errors }` |
| `assertOneToOne` | Throws if not 1:1 within hop tolerance |
| `ACCURACY_CLASS_1000` | `"1000:1000"` contract label |

## Scripts

```bash
npm install
npm run build
npm run harness          # PASS on fixtures/demo-1000.json
npm run test:journal     # node:test suite
```

## Vendor

`vendor/smaller-aura-src/` — lean copy from `trinitywayve-aura/src` for STEEL embed. Journal emission hooks can later call into this package; vendor README note preserved.
