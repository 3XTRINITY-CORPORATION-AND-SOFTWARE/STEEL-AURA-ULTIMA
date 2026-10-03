// Public API = the documented journal (see ../README.md): record/read/serialize paired
// audio+viz hops, validateJournal, assertOneToOne, ACCURACY_CLASS_1000.
export {
  ACCURACY_CLASS_1000, JOURNAL_SCHEMA, FrequencyPatternJournal, validateJournal, assertOneToOne,
  type AccuracyClass, type AudioHopSample, type VizHopSample, type FrequencyPatternEntry,
  type FrequencyPatternJournalMeta, type FrequencyPatternJournalDocument,
  type ValidateJournalOptions, type ValidateJournalResult, type RecordHopInput,
} from './frequencyPatternJournal.ts';
// Earlier scaffold hop-journal (header+hops model). Kept under a distinct name: it used to
// shadow the documented `FrequencyPatternJournal` export, which broke dist consumers.
export {
  FrequencyPatternJournal as HopJournal, type AuraMode, type JournalHop, type JournalHeader,
  type FrequencyPatternJournalData, type JournalWriteResult,
} from './frequency-pattern-journal.ts';
export {
  AURA_MODES, VENDOR_SMALLER_AURA_SRC, type VendorTrackSlot, type VendorTrackState,
} from './vendor-bridge.ts';
