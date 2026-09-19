#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FrequencyPatternJournal,
  validateJournal,
  assertOneToOne,
  ACCURACY_CLASS_1000,
} from '../dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const defaultFixture = join(here, '..', 'fixtures', 'demo-1000.json')
const path = process.argv[2] ?? defaultFixture

const raw = readFileSync(path, 'utf8')
const doc = JSON.parse(raw)
const result = validateJournal(doc, { requireContiguousHops: true })

console.log('=== FrequencyPatternJournal harness ===')
console.log(`fixture: ${path}`)
console.log(`accuracyClass: ${doc.accuracyClass ?? '(missing)'} (contract: ${ACCURACY_CLASS_1000})`)
console.log(`entries: ${result.entryCount}`)
console.log(`ok: ${result.ok}`)
if (result.warnings.length) {
  console.log('warnings:')
  for (const w of result.warnings) console.log(`  - ${w}`)
}
if (!result.ok) {
  console.log('errors:')
  for (const e of result.errors) console.log(`  - ${e}`)
  console.log('RESULT: FAIL')
  console.log('NOTE: Do not claim 1000:1000 production accuracy without harness PASS.')
  process.exit(1)
}

assertOneToOne(doc, { requireContiguousHops: true })
const journal = FrequencyPatternJournal.fromDocument(doc)
console.log(`loaded journal size: ${journal.size}`)
console.log(`sample hop0 t=${journal.getByHop(0)?.t}`)
console.log('RESULT: PASS')
console.log('NOTE: Fixture PASS ≠ production accuracy. Measure on real audio before claiming.')
