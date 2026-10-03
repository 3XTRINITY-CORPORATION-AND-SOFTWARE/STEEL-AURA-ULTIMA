import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFrequencyPatternJournal } from './readJournal.ts'
import { planFromJournal } from './index.ts'

// Regression: Ultima reader + plan must consume the documented aura-viz journal API
// (previously readJournal pointed at a never-built dist/ and index.ts at a shadowing stub).
test('Ultima reads aura-viz fixture and plans from journal (class and document)', () => {
  const journal = readFrequencyPatternJournal()
  assert.equal(journal.size, 8)
  assert.equal(planFromJournal({ journal }).hopCount, 8)
  assert.equal(planFromJournal({ journal: journal.toDocument() }).hopCount, 8)
})
