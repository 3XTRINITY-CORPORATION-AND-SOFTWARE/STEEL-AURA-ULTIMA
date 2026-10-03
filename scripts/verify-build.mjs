#!/usr/bin/env node
// Build verification: fail if expected build outputs are missing/empty.
import { statSync } from 'node:fs'

const expected = [
  'packages/aura-viz/dist/index.js',
  'packages/aura-viz/dist/index.d.ts',
  'packages/aura-viz/dist/frequencyPatternJournal.js',
  'apps/aurora-borealis-ultima/dist/index.html',
  'apps/aurora-borealis-ultima/dist/fixtures/demo-1000.json',
]

const bad = expected.filter((p) => {
  try { return statSync(p).size === 0 } catch { return true }
})
if (bad.length) {
  console.error('build verification FAILED; missing/empty:\n  ' + bad.join('\n  '))
  process.exit(1)
}
console.log(`build verification OK (${expected.length} outputs present)`)
