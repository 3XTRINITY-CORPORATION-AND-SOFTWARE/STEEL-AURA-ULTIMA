import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FrequencyPatternJournal,
  assertOneToOne,
  validateJournal,
  ACCURACY_CLASS_1000,
} from '../dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const fixturePath = join(here, '..', 'fixtures', 'demo-1000.json')

describe('FrequencyPatternJournal 1000:1000', () => {
  it('records paired hops and serializes JSON', () => {
    const j = new FrequencyPatternJournal({
      hopDurationSec: 0.02,
      hopToleranceSec: 0.01,
      meta: { source: 'unit-test' },
    })
    j.recordHop(0, { eq: [0.1, 0.2] }, { bins: [0.1, 0.2], mode: 'bars' })
    j.recordHop(1, { eq: [0.3, 0.4] }, { bins: [0.3, 0.4], mode: 'bars', frame: 1 })
    assert.equal(j.size, 2)
    assert.equal(j.accuracyClass, ACCURACY_CLASS_1000)
    const doc = j.toDocument()
    assert.equal(doc.entries.length, 2)
    assertOneToOne(doc)
    const round = FrequencyPatternJournal.fromJSON(j.toJSON(false))
    assert.equal(round.size, 2)
    assert.deepEqual(round.getByHop(1)?.audio.eq, [0.3, 0.4])
  })

  it('rejects viz-only decorative samples', () => {
    const j = new FrequencyPatternJournal({ hopDurationSec: 0.02 })
    assert.throws(
      () =>
        j.record({
          hop: 0,
          t: 0,
          audio: { eq: [] },
          viz: { bins: [1, 2, 3] },
        }),
      /audio\.eq required/,
    )
  })

  it('validateJournal fails when audio side missing', () => {
    const bad = {
      schema: 1,
      accuracyClass: ACCURACY_CLASS_1000,
      hopDurationSec: 0.02,
      hopToleranceSec: 0.01,
      entries: [{ hop: 0, t: 0, viz: { bins: [1] } }],
    }
    const r = validateJournal(bad)
    assert.equal(r.ok, false)
    assert.ok(r.errors.some((e) => e.includes('audio')))
  })

  it('fixture demo-1000.json PASSes assertOneToOne', () => {
    const raw = readFileSync(fixturePath, 'utf8')
    const doc = JSON.parse(raw)
    const result = validateJournal(doc, { requireContiguousHops: true })
    assert.equal(result.ok, true, result.errors.join('; '))
    assert.equal(result.entryCount, 8)
    assertOneToOne(doc, { requireContiguousHops: true })
    const loaded = FrequencyPatternJournal.fromDocument(doc)
    assert.equal(loaded.getByTime(0.05)?.hop, 2)
  })
})
