/**
 * FrequencyPatternJournal — smaller AURA 1:1 audio↔EQ/viz sync journal.
 *
 * Contract class: **1000:1000** (contracts/AURA-1to1.md, NORTH-STAR §7)
 * One visual frame/bin update class per audio analysis hop; no decorative drift.
 * Ultima (apps/aurora-borealis-ultima) reads this journal as a JSON sidecar.
 *
 * Honesty: harness PASS on a fixture is required before claiming production accuracy.
 */

/** Contract accuracy class label — not a measured production claim. */
export const ACCURACY_CLASS_1000 = '1000:1000' as const
export type AccuracyClass = typeof ACCURACY_CLASS_1000

export const JOURNAL_SCHEMA = 1 as const

/** Audio / EQ measurement for one analysis hop. */
export type AudioHopSample = {
  /** EQ band levels (normalized 0..1 recommended). Required. */
  eq: number[]
  /** Optional raw analyser spectrum bins. */
  spectrum?: number[]
}

/** Viz bin / frame payload for the same hop. Must pair with audio. */
export type VizHopSample = {
  /** Viz bins / bar heights / frame payload. Required. */
  bins: number[]
  /** Optional viz mode label (e.g. bars | ring | wave | bloom). */
  mode?: string
  /** Optional render frame index. */
  frame?: number
}

/**
 * One journal entry: paired audio + viz at a timeline hop.
 * Keyed by hop index and timeline time (seconds).
 */
export type FrequencyPatternEntry = {
  /** Analysis hop index (0-based). */
  hop: number
  /** Timeline time in seconds (audio clock). */
  t: number
  audio: AudioHopSample
  viz: VizHopSample
}

export type FrequencyPatternJournalMeta = {
  mediaId?: string
  createdAt?: string
  source?: string
  sampleRateHz?: number
  note?: string
}

/** Serializable journal document (JSON sidecar). */
export type FrequencyPatternJournalDocument = {
  schema: typeof JOURNAL_SCHEMA
  /** Contract accuracy class this journal targets. */
  accuracyClass: AccuracyClass
  /** Seconds per analysis hop. */
  hopDurationSec: number
  /** Max |t - hop * hopDurationSec| allowed when validating (seconds). */
  hopToleranceSec: number
  entries: FrequencyPatternEntry[]
  meta?: FrequencyPatternJournalMeta
}

export type ValidateJournalOptions = {
  /** Override hop time tolerance (seconds). Default: document.hopToleranceSec. */
  hopToleranceSec?: number
  /** If true, require strictly ascending hop indices with no gaps from 0. */
  requireContiguousHops?: boolean
}

export type ValidateJournalResult = {
  ok: boolean
  accuracyClass: AccuracyClass
  entryCount: number
  errors: string[]
  warnings: string[]
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

function isNumberArray(a: unknown): a is number[] {
  return Array.isArray(a) && a.every(isFiniteNumber)
}

/**
 * Validate that every viz sample has a paired audio sample within hop tolerance.
 * Fails on viz-only / audio-only / decorative drift / bad timing.
 */
export function validateJournal(
  doc: FrequencyPatternJournalDocument,
  options: ValidateJournalOptions = {},
): ValidateJournalResult {
  const errors: string[] = []
  const warnings: string[] = []
  const tol =
    options.hopToleranceSec ??
    (isFiniteNumber(doc.hopToleranceSec) ? doc.hopToleranceSec : 0)

  if (doc.schema !== JOURNAL_SCHEMA) {
    errors.push(`unsupported schema: ${String(doc.schema)} (expected ${JOURNAL_SCHEMA})`)
  }
  if (doc.accuracyClass !== ACCURACY_CLASS_1000) {
    errors.push(
      `accuracyClass must be "${ACCURACY_CLASS_1000}" (got ${String(doc.accuracyClass)})`,
    )
  }
  if (!isFiniteNumber(doc.hopDurationSec) || doc.hopDurationSec <= 0) {
    errors.push('hopDurationSec must be a positive finite number')
  }
  if (!Array.isArray(doc.entries)) {
    errors.push('entries must be an array')
    return {
      ok: false,
      accuracyClass: ACCURACY_CLASS_1000,
      entryCount: 0,
      errors,
      warnings,
    }
  }

  const seenHops = new Set<number>()
  for (let i = 0; i < doc.entries.length; i++) {
    const e = doc.entries[i]
    const loc = `entries[${i}]`

    if (!e || typeof e !== 'object') {
      errors.push(`${loc}: not an object`)
      continue
    }
    if (!isFiniteNumber(e.hop) || e.hop < 0 || !Number.isInteger(e.hop)) {
      errors.push(`${loc}: hop must be a non-negative integer`)
    }
    if (!isFiniteNumber(e.t) || e.t < 0) {
      errors.push(`${loc}: t must be a non-negative finite number`)
    }
    if (seenHops.has(e.hop)) {
      errors.push(`${loc}: duplicate hop ${e.hop}`)
    } else {
      seenHops.add(e.hop)
    }

    if (!e.audio || typeof e.audio !== 'object') {
      errors.push(`${loc}: missing audio side (1:1 violation)`)
    } else if (!isNumberArray(e.audio.eq) || e.audio.eq.length === 0) {
      errors.push(`${loc}: audio.eq must be a non-empty number[]`)
    } else if (e.audio.spectrum !== undefined && !isNumberArray(e.audio.spectrum)) {
      errors.push(`${loc}: audio.spectrum must be number[] when present`)
    }

    if (!e.viz || typeof e.viz !== 'object') {
      errors.push(`${loc}: missing viz side (1:1 violation)`)
    } else if (!isNumberArray(e.viz.bins) || e.viz.bins.length === 0) {
      errors.push(`${loc}: viz.bins must be a non-empty number[]`)
    }

    if (
      isFiniteNumber(e.hop) &&
      isFiniteNumber(e.t) &&
      isFiniteNumber(doc.hopDurationSec) &&
      doc.hopDurationSec > 0
    ) {
      const expected = e.hop * doc.hopDurationSec
      const drift = Math.abs(e.t - expected)
      if (drift > tol) {
        errors.push(
          `${loc}: t=${e.t} drifts ${drift}s from hop*hopDuration=${expected} (tol=${tol})`,
        )
      }
    }
  }

  if (options.requireContiguousHops && doc.entries.length > 0) {
    for (let h = 0; h < doc.entries.length; h++) {
      if (!seenHops.has(h)) {
        errors.push(`missing contiguous hop ${h}`)
      }
    }
  }

  if (doc.entries.length === 0) {
    warnings.push('journal has zero entries')
  }

  return {
    ok: errors.length === 0,
    accuracyClass: ACCURACY_CLASS_1000,
    entryCount: doc.entries.length,
    errors,
    warnings,
  }
}

/**
 * Assert 1:1 pairing. Throws with joined errors if validation fails.
 * Lightweight harness entrypoint for Ultima / CI.
 */
export function assertOneToOne(
  doc: FrequencyPatternJournalDocument,
  options?: ValidateJournalOptions,
): void {
  const result = validateJournal(doc, options)
  if (!result.ok) {
    throw new Error(
      `FrequencyPatternJournal 1000:1000 assertOneToOne FAILED (${result.errors.length} error(s)):\n` +
        result.errors.map((e) => `  - ${e}`).join('\n'),
    )
  }
}

export type RecordHopInput = {
  hop: number
  t: number
  audio: AudioHopSample
  viz: VizHopSample
}

/**
 * Mutable recorder / reader for the frequency pattern journal.
 * Emits JSON sidecars suitable for AURORA BOREALIS ULTIMA™.
 */
export class FrequencyPatternJournal {
  readonly schema = JOURNAL_SCHEMA
  readonly accuracyClass: AccuracyClass = ACCURACY_CLASS_1000
  hopDurationSec: number
  hopToleranceSec: number
  meta: FrequencyPatternJournalMeta
  private readonly entriesByHop = new Map<number, FrequencyPatternEntry>()

  constructor(opts: {
    hopDurationSec: number
    hopToleranceSec?: number
    meta?: FrequencyPatternJournalMeta
  }) {
    if (!isFiniteNumber(opts.hopDurationSec) || opts.hopDurationSec <= 0) {
      throw new Error('hopDurationSec must be a positive finite number')
    }
    this.hopDurationSec = opts.hopDurationSec
    this.hopToleranceSec =
      opts.hopToleranceSec !== undefined ? opts.hopToleranceSec : opts.hopDurationSec * 0.5
    this.meta = { ...(opts.meta ?? {}) }
  }

  get size(): number {
    return this.entriesByHop.size
  }

  /** Record one paired audio+viz hop. Rejects incomplete pairs. */
  record(input: RecordHopInput): FrequencyPatternEntry {
    if (!isFiniteNumber(input.hop) || input.hop < 0 || !Number.isInteger(input.hop)) {
      throw new Error('hop must be a non-negative integer')
    }
    if (!isFiniteNumber(input.t) || input.t < 0) {
      throw new Error('t must be a non-negative finite number')
    }
    if (!input.audio || !isNumberArray(input.audio.eq) || input.audio.eq.length === 0) {
      throw new Error('audio.eq required (no viz-only decorative samples)')
    }
    if (!input.viz || !isNumberArray(input.viz.bins) || input.viz.bins.length === 0) {
      throw new Error('viz.bins required (no audio-only samples)')
    }

    const entry: FrequencyPatternEntry = {
      hop: input.hop,
      t: input.t,
      audio: {
        eq: [...input.audio.eq],
        ...(input.audio.spectrum ? { spectrum: [...input.audio.spectrum] } : {}),
      },
      viz: {
        bins: [...input.viz.bins],
        ...(input.viz.mode !== undefined ? { mode: input.viz.mode } : {}),
        ...(input.viz.frame !== undefined ? { frame: input.viz.frame } : {}),
      },
    }
    this.entriesByHop.set(entry.hop, entry)
    return entry
  }

  /** Convenience: record using hop index → t = hop * hopDurationSec. */
  recordHop(
    hop: number,
    audio: AudioHopSample,
    viz: VizHopSample,
  ): FrequencyPatternEntry {
    return this.record({
      hop,
      t: hop * this.hopDurationSec,
      audio,
      viz,
    })
  }

  getByHop(hop: number): FrequencyPatternEntry | undefined {
    return this.entriesByHop.get(hop)
  }

  /** Nearest entry by timeline time (seconds). */
  getByTime(t: number): FrequencyPatternEntry | undefined {
    if (!isFiniteNumber(t) || this.entriesByHop.size === 0) return undefined
    let best: FrequencyPatternEntry | undefined
    let bestDist = Infinity
    for (const e of this.entriesByHop.values()) {
      const d = Math.abs(e.t - t)
      if (d < bestDist) {
        bestDist = d
        best = e
      }
    }
    return best
  }

  entries(): FrequencyPatternEntry[] {
    return [...this.entriesByHop.values()].sort((a, b) => a.hop - b.hop)
  }

  toDocument(): FrequencyPatternJournalDocument {
    return {
      schema: this.schema,
      accuracyClass: this.accuracyClass,
      hopDurationSec: this.hopDurationSec,
      hopToleranceSec: this.hopToleranceSec,
      entries: this.entries(),
      ...(Object.keys(this.meta).length > 0 ? { meta: { ...this.meta } } : {}),
    }
  }

  toJSON(pretty = true): string {
    return JSON.stringify(this.toDocument(), null, pretty ? 2 : undefined)
  }

  static fromDocument(doc: FrequencyPatternJournalDocument): FrequencyPatternJournal {
    const j = new FrequencyPatternJournal({
      hopDurationSec: doc.hopDurationSec,
      hopToleranceSec: doc.hopToleranceSec,
      meta: doc.meta,
    })
    for (const e of doc.entries ?? []) {
      j.record({
        hop: e.hop,
        t: e.t,
        audio: e.audio,
        viz: e.viz,
      })
    }
    return j
  }

  static fromJSON(raw: string): FrequencyPatternJournal {
    const doc = JSON.parse(raw) as FrequencyPatternJournalDocument
    return FrequencyPatternJournal.fromDocument(doc)
  }

  validate(options?: ValidateJournalOptions): ValidateJournalResult {
    return validateJournal(this.toDocument(), options)
  }

  assertOneToOne(options?: ValidateJournalOptions): void {
    assertOneToOne(this.toDocument(), options)
  }
}
