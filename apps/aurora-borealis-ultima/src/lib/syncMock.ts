/**
 * Mock AURA 1:1 sync adapter.
 * Contract: contracts/SYNC.md — skew budget ±200ms (0±0.2s).
 * Later: wire packages/sync-kernel + aura-viz journal.
 */

export const SKEW_BUDGET_MS = 200

export type SyncStatus = 'LOCKED' | 'DRIFT'

export interface SyncSample {
  /** Skew in ms: positive = kernel ahead of UI compensation. */
  skewMs: number
  status: SyncStatus
  rttMs: number
  label: 'MOCK'
}

/** Oscillating mock skew that mostly stays inside ±200ms, occasionally drifts. */
export function sampleMockSync(tSec: number): SyncSample {
  const base = Math.sin(tSec * 0.55) * 90 + Math.sin(tSec * 1.3) * 40
  const spike = Math.sin(tSec * 0.11) > 0.92 ? 160 : 0
  const skewMs = Math.round(base + spike)
  const rttMs = Math.round(18 + Math.abs(Math.sin(tSec * 0.8)) * 22)
  const status: SyncStatus = Math.abs(skewMs) <= SKEW_BUDGET_MS ? 'LOCKED' : 'DRIFT'
  return { skewMs, status, rttMs, label: 'MOCK' }
}

/** Map skewMs ∈ [-200, 200] → 0..1 for meter (clamped). */
export function skewToMeter(skewMs: number): number {
  const clamped = Math.max(-SKEW_BUDGET_MS, Math.min(SKEW_BUDGET_MS, skewMs))
  return (clamped + SKEW_BUDGET_MS) / (SKEW_BUDGET_MS * 2)
}
