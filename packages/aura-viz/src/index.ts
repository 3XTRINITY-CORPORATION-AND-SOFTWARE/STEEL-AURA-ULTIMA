// Public API = the documented journal (see ../README.md): record/read/serialize paired
// audio+viz hops, validateJournal, assertOneToOne, ACCURACY_CLASS_1000.
export {
  ACCURACY_CLASS_1000, JOURNAL_SCHEMA, FrequencyPatternJournal, validateJournal, assertOneToOne,
  type AccuracyClass, type AudioHopSample, type VizHopSample, type FrequencyPatternEntry,
  type FrequencyPatternJournalMeta, type FrequencyPatternJournalDocument,
  type ValidateJournalOptions, type ValidateJournalResult, type RecordHopInput,
} from './frequencyPatternJournal.ts';
// Legacy scaffold hop-journal (header+hops model) — separate class with distinct semantics,
// NOT an alias of FrequencyPatternJournal. Compatibility boundary only.
export {
  HopJournal, type AuraMode, type JournalHop, type JournalHeader,
  type HopJournalData, type JournalWriteResult,
} from './frequency-pattern-journal.ts';
export {
  AURA_MODES, VENDOR_SMALLER_AURA_SRC, type VendorTrackSlot, type VendorTrackState,
} from './vendor-bridge.ts';
