/**
 * Ultima reader stub — loads smaller AURA FrequencyPatternJournal JSON sidecar.
 * Contract: contracts/ULTIMA.md + contracts/AURA-1to1.md (1000:1000).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FrequencyPatternJournal,
  assertOneToOne,
  validateJournal,
  ACCURACY_CLASS_1000,
  type FrequencyPatternJournalDocument,
} from '../../../packages/aura-viz/dist/index.js'

const here = dirname(fileURLToPath(import.meta.url))

export function defaultFixturePath(): string {
  return join(here, '../../../packages/aura-viz/fixtures/demo-1000.json')
}

export function loadJournalDocument(path: string): FrequencyPatternJournalDocument {
  const raw = readFileSync(path, 'utf8')
  return JSON.parse(raw) as FrequencyPatternJournalDocument
}

export function readFrequencyPatternJournal(
  path: string = defaultFixturePath(),
): FrequencyPatternJournal {
  const doc = loadJournalDocument(path)
  const result = validateJournal(doc, { requireContiguousHops: true })
  if (!result.ok) {
    throw new Error(
      `Ultima refused journal (1000:1000 FAIL): ${result.errors.join('; ')}`,
    )
  }
  assertOneToOne(doc, { requireContiguousHops: true })
  return FrequencyPatternJournal.fromDocument(doc)
}

export function main(argv: string[] = process.argv.slice(2)): void {
  const path = argv[0] ?? defaultFixturePath()
  const journal = readFrequencyPatternJournal(path)
  console.log('Ultima read FrequencyPatternJournal')
  console.log(`  path: ${path}`)
  console.log(`  accuracyClass: ${journal.accuracyClass}`)
  console.log(`  contract label: ${ACCURACY_CLASS_1000}`)
  console.log(`  entries: ${journal.size}`)
  console.log(`  hopDurationSec: ${journal.hopDurationSec}`)
  const first = journal.getByHop(0)
  console.log(`  hop0: t=${first?.t} eqBands=${first?.audio.eq.length} vizBins=${first?.viz.bins.length}`)
  console.log('RESULT: PASS (fixture/harness — not production accuracy claim)')
}
