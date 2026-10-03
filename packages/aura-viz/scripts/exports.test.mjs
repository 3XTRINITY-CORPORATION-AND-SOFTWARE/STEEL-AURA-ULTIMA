import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as api from '../dist/index.js'

// Public-API regression: FrequencyPatternJournal is the documented class; HopJournal is the
// legacy scaffold, exported separately with different semantics (NOT an alias).
describe('aura-viz public exports', () => {
  it('runtime export surface is exactly the expected set', () => {
    assert.deepEqual(Object.keys(api).sort(), [
      'ACCURACY_CLASS_1000', 'AURA_MODES', 'FrequencyPatternJournal', 'HopJournal',
      'JOURNAL_SCHEMA', 'VENDOR_SMALLER_AURA_SRC', 'assertOneToOne', 'validateJournal',
    ])
  })

  it('documented API', () => {
    assert.equal(api.ACCURACY_CLASS_1000, '1000:1000')
    assert.equal(typeof api.validateJournal, 'function')
    assert.equal(typeof api.assertOneToOne, 'function')
    assert.equal(api.FrequencyPatternJournal.name, 'FrequencyPatternJournal')
    assert.equal(typeof api.FrequencyPatternJournal.fromDocument, 'function')
    assert.equal(typeof api.FrequencyPatternJournal.fromJSON, 'function')
  })

  it('HopJournal is a distinct class, not an alias', () => {
    assert.notEqual(api.HopJournal, api.FrequencyPatternJournal)
    assert.equal(api.HopJournal.name, 'HopJournal')
    assert.equal(api.HopJournal.fromDocument, undefined)
    assert.equal(api.HopJournal.prototype.validate, undefined)
    const doc = new api.FrequencyPatternJournal({ hopDurationSec: 0.02 })
    doc.recordHop(0, { eq: [0.1] }, { bins: [0.1] })
    assert.equal(typeof doc.toJSON(), 'string') // documented: JSON string of a document
    const legacy = new api.HopJournal('x')
    assert.equal(legacy.write({ hopIndex: 0, audioMs: 0, vizFrameIndex: 0, bins: [1] }).accepted, true)
    const data = legacy.toJSON()
    assert.equal(typeof data, 'object') // legacy: header+hops object
    assert.equal(data.header.hopCount, 1)
  })
})
