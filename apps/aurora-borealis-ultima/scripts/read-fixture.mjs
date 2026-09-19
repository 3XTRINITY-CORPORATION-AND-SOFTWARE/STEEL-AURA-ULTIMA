#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FrequencyPatternJournal,
  assertOneToOne,
  validateJournal,
  ACCURACY_CLASS_1000,
} from '../../../packages/aura-viz/dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const fixture =
  process.argv[2] ??
  join(here, '../../../packages/aura-viz/fixtures/demo-1000.json')

const doc = JSON.parse(readFileSync(fixture, 'utf8'))
const result = validateJournal(doc, { requireContiguousHops: true })

console.log('=== AURORA BOREALIS ULTIMA™ — journal reader ===')
console.log(`fixture: ${fixture}`)
console.log(`accuracyClass: ${doc.accuracyClass} (contract: ${ACCURACY_CLASS_1000})`)

if (!result.ok) {
  console.error('VALIDATION FAIL:')
  for (const e of result.errors) console.error(`  - ${e}`)
  process.exit(1)
}

assertOneToOne(doc, { requireContiguousHops: true })
const journal = FrequencyPatternJournal.fromDocument(doc)
console.log(`entries: ${journal.size}`)
console.log(`hop0 t=${journal.getByHop(0)?.t}`)
console.log('RESULT: PASS')
console.log('Honesty: harness PASS on fixture ≠ 1000:1000 production accuracy.')
