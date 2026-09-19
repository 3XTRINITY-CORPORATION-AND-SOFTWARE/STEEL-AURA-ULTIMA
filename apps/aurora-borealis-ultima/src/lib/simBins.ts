/** Simulated AURA frequency bins for Stage (honest SIM label). */

export const BIN_COUNT = 64

/** Soft-noise aurora spectrum for demo when no live analyser is wired. */
export function tickSimBins(prev: Float32Array, tSec: number): Float32Array {
  const out: Float32Array = prev.length === BIN_COUNT ? prev : new Float32Array(BIN_COUNT)
  for (let i = 0; i < BIN_COUNT; i++) {
    const band = i / BIN_COUNT
    const wave =
      0.35 * Math.sin(tSec * 1.7 + band * 9.2) +
      0.22 * Math.sin(tSec * 1.3 + band * 4.1) +
      0.15 * Math.sin(tSec * 0.6 + i * 0.4)
    const bass = Math.exp(-band * 3.2) * (0.45 + 0.35 * Math.sin(tSec * 2.2))
    const target = Math.min(1, Math.max(0.04, 0.28 + wave * 0.35 + bass * 0.55))
    out[i] = out[i] * 0.72 + target * 0.28
  }
  return out
}
